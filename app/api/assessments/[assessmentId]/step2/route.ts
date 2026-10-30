import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm/client';
import { SYSTEM_PROMPT, createStep2Prompt, Step2ResponseSchema } from '@/lib/llm/prompts/step2';

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

    // Get selected regulation from Step 1
    const { data: step1Data, error: step1Error } = await supabase
      .from('step1_regulation_analysis')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (step1Error || !step1Data?.selected_regulation) {
      return NextResponse.json(
        { error: 'No regulation selected in Step 1' },
        { status: 400 }
      );
    }

    // Get questionnaire responses for context
    const { data: responses } = await supabase
      .from('questionnaire_responses')
      .select('*, questions:question_id(*)')
      .eq('assessment_id', assessmentId);

    const userContext = responses
      ?.map((r: any) => `${r.questions?.question_text}: ${r.response_value}`)
      .join('\n') || '';

    // Generate requirements using LLM
    const prompt = createStep2Prompt(step1Data.selected_regulation, userContext);
    const llmResponse = await llm.generateStructured(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      Step2ResponseSchema,
      { temperature: 0.7, maxTokens: 3000 }
    );

    if (!llmResponse.parsed) {
      return NextResponse.json(
        { error: 'Failed to generate requirements' },
        { status: 500 }
      );
    }

    // Delete existing requirements
    await supabase
      .from('step2_requirements')
      .delete()
      .eq('assessment_id', assessmentId);

    // Save requirements to database
    const requirementsToInsert = llmResponse.parsed.requirements.map((req: any) => ({
      assessment_id: assessmentId,
      requirement_text: req.text,
      category: req.category,
      standard_clause: req.standardClause || null,
      priority: req.priority || 'medium',
      is_selected: false,
    }));

    const { error: insertError } = await supabase
      .from('step2_requirements')
      .insert(requirementsToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch the saved requirements with IDs
    const { data: savedRequirements } = await supabase
      .from('step2_requirements')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('category', { ascending: true });

    // Transform to frontend format
    const transformedRequirements = savedRequirements?.map((req: any) => ({
      id: req.id,
      requirement_id: req.standard_clause || '',
      title: req.requirement_text.substring(0, 100), // First 100 chars as title
      description: req.requirement_text,
      category: req.category,
      priority: req.priority || 'medium',
      is_selected: req.is_selected,
    })) || [];

    return NextResponse.json({
      requirements: transformedRequirements,
      totalCount: transformedRequirements.length,
    });
  } catch (error: any) {
    console.error('Step 2 API error:', error);
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
      .from('step2_requirements')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('category', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to frontend format
    const transformedRequirements = data?.map((req: any) => ({
      id: req.id,
      requirement_id: req.standard_clause || '',
      title: req.requirement_text.substring(0, 100), // First 100 chars as title
      description: req.requirement_text,
      category: req.category,
      priority: req.priority || 'medium',
      is_selected: req.is_selected,
    })) || [];

    return NextResponse.json({ requirements: transformedRequirements });
  } catch (error: any) {
    console.error('Step 2 GET API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
