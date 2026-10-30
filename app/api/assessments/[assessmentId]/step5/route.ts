import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm/client';
import { SYSTEM_PROMPT, createStep5Prompt, Step5ResponseSchema } from '@/lib/llm/prompts/step5';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId } = await params;
    const body = await request.json();
    const { testResults } = body; // Test results as string

    if (!testResults) {
      return NextResponse.json(
        { error: 'Test results required' },
        { status: 400 }
      );
    }

    // Get selected requirements from Step 2
    const { data: requirements, error: reqError } = await supabase
      .from('step2_requirements')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('is_selected', true);

    if (reqError || !requirements) {
      return NextResponse.json({ error: reqError?.message }, { status: 500 });
    }

    // Get selected regulation name
    const { data: step1Data } = await supabase
      .from('step1_regulation_analysis')
      .select('selected_regulation')
      .eq('assessment_id', assessmentId)
      .single();

    const regulationName = step1Data?.selected_regulation || 'Selected Standard';

    // Format requirements for LLM
    const formattedRequirements = requirements.map((req) => ({
      text: req.requirement_text,
      category: req.category,
    }));

    // Generate vulnerability analysis using LLM
    const prompt = createStep5Prompt(testResults, formattedRequirements, regulationName);
    const llmResponse = await llm.generateStructured(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      Step5ResponseSchema,
      { temperature: 0.7, maxTokens: 4000 }
    );

    if (!llmResponse.parsed) {
      return NextResponse.json(
        { error: 'Failed to generate analysis' },
        { status: 500 }
      );
    }

    // Generate markdown report
    const markdownReport = generateMarkdownReport(
      llmResponse.parsed,
      regulationName
    );

    // Save to database
    const { error: saveError } = await supabase
      .from('step5_final_report')
      .upsert({
        assessment_id: assessmentId,
        overall_status: llmResponse.parsed.overallStatus,
        vulnerabilities: llmResponse.parsed.vulnerabilities,
        recommendations: llmResponse.parsed.recommendations,
        risk_score: llmResponse.parsed.riskScore,
        report_markdown: markdownReport,
      });

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    // Update assessment to completed
    await supabase
      .from('assessments')
      .update({
        current_step: 5,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', assessmentId);

    return NextResponse.json({
      ...llmResponse.parsed,
      reportMarkdown: markdownReport,
    });
  } catch (error: any) {
    console.error('Step 5 API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId } = await params;

    const { data, error } = await supabase
      .from('step5_final_report')
      .select('*')
      .eq('assessment_id', assessmentId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no report exists yet, return empty report structure
    if (!data) {
      return NextResponse.json({ report: null });
    }

    return NextResponse.json({ report: data });
  } catch (error: any) {
    console.error('Step 5 GET API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMarkdownReport(data: any, regulationName: string): string {
  const statusEmoji = {
    compliant: '✅',
    non_compliant: '❌',
    partial: '⚠️',
  };

  return `# Cybersecurity Compliance Report

**Regulation:** ${regulationName}  
**Status:** ${statusEmoji[data.overallStatus as keyof typeof statusEmoji]} ${data.overallStatus.replace('_', ' ').toUpperCase()}  
**Risk Score:** ${data.riskScore}/100  
**Compliance:** ${data.compliancePercentage}%  
**Date:** ${new Date().toLocaleDateString()}

---

## Executive Summary

${data.summary}

---

## Vulnerabilities Identified

${data.vulnerabilities.length > 0 ? data.vulnerabilities.map((v: any, i: number) => `
### ${i + 1}. ${v.title} [${v.id}]

**Severity:** ${v.severity.toUpperCase()}  
**Affected Requirement:** ${v.affectedRequirement}  
${v.cveId ? `**CVE ID:** ${v.cveId}` : ''}

**Description:** ${v.description}

**Recommendation:** ${v.recommendation}

---
`).join('\n') : 'No vulnerabilities identified.'}

## Recommendations

${data.recommendations.map((r: any, i: number) => `
### ${i + 1}. ${r.title}

**Priority:** ${r.priority.replace('_', ' ').toUpperCase()}  
**Effort:** ${r.effort.toUpperCase()}

${r.description}

---
`).join('\n')}

## Compliance Statistics

- **Overall Compliance:** ${data.compliancePercentage}%
- **Risk Score:** ${data.riskScore}/100
- **Critical Issues:** ${data.vulnerabilities.filter((v: any) => v.severity === 'critical').length}
- **High Issues:** ${data.vulnerabilities.filter((v: any) => v.severity === 'high').length}
- **Medium Issues:** ${data.vulnerabilities.filter((v: any) => v.severity === 'medium').length}
- **Low Issues:** ${data.vulnerabilities.filter((v: any) => v.severity === 'low').length}

---

*Report generated by Securer - Cybersecurity Compliance Assessment Platform*
`;
}
