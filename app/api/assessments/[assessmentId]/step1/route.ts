import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm/client';
import { SYSTEM_PROMPT, createStep1Prompt, Step1ResponseSchema } from '@/lib/llm/prompts/step1';

function enforceRedRecommendation(recommendations: any[]) {
  const RED_NAME = 'Radio Equipment Directive (RED, EU Directive 2014/53/EU)';
  const existingIndex = recommendations.findIndex(
    (r) => r.name?.toLowerCase().includes('radio equipment directive')
  );

  if (existingIndex === 0) {
    if (recommendations[0].relevanceScore < 85) {
      recommendations[0].relevanceScore = 85;
    }
    return recommendations;
  }

  if (existingIndex > 0) {
    const redEntry = recommendations.splice(existingIndex, 1)[0];
    redEntry.relevanceScore = Math.max(redEntry.relevanceScore ?? 85, 85);
    recommendations.unshift(redEntry);
    return recommendations;
  }

  const redRecommendation = {
    name: RED_NAME,
    description: 'Foundational EU radio equipment compliance for wireless smart home devices.',
    relevanceScore: 90,
    reasoning: 'RED is mandatory for wireless device compliance in EU and globally recognized for IoT communications.',
    keyRequirements: [
      'Radio frequency spectrum usage limits and EMC',
      'Essential safety requirements for radio equipment',
      'CE Marking and conformity assessment',
      'Technical documentation and traceability',
      'Post-market surveillance and incident reporting',
    ],
  };

  return [redRecommendation, ...recommendations];
}

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

    // Verify assessment belongs to user
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Get questionnaire responses
    const { data: responses, error: responsesError } = await supabase
      .from('questionnaire_responses')
      .select('*, questions:question_id(*)')
      .eq('assessment_id', assessmentId);

    if (responsesError) {
      return NextResponse.json({ error: responsesError.message }, { status: 500 });
    }

    // Format responses for LLM
    const formattedResponses: Record<string, string> = {};
    responses?.forEach((r: any) => {
      if (r.questions) {
        formattedResponses[r.questions.question_text] = r.response_value;
      }
    });

    // Generate regulation recommendations using LLM
    const prompt = createStep1Prompt(formattedResponses);
    const llmResponse = await llm.generateStructured(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      Step1ResponseSchema,
      { temperature: 0.7, maxTokens: 2000 }
    );

    if (!llmResponse.parsed) {
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    const recommendations = enforceRedRecommendation(
      llmResponse.parsed.recommendations || []
    );

    // Save to database (upsert on assessment_id conflict)
    const { data: savedData, error: saveError } = await supabase
      .from('step1_regulation_analysis')
      .upsert(
        {
          assessment_id: assessmentId,
          recommended_regulations: recommendations,
          reasoning: llmResponse.parsed.analysis,
        },
        {
          onConflict: 'assessment_id',
        }
      )
      .select()
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({
      regulations: recommendations.map((rec: any) => ({
        regulation: rec.name,
        relevance_score: rec.relevanceScore,
        reasoning: rec.reasoning,
        key_requirements: rec.keyRequirements,
        description: rec.description,
      })),
      analysis: llmResponse.parsed.analysis,
    });
  } catch (error: any) {
    console.error('Step 1 API error:', error);
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
      .from('step1_regulation_analysis')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform database format to frontend format
    const transformedData = {
      regulations: data?.recommended_regulations?.map((rec: any) => ({
        regulation: rec.name,
        relevance_score: rec.relevanceScore,
        reasoning: rec.reasoning,
        key_requirements: rec.keyRequirements,
        description: rec.description,
      })) || [],
      selected_regulation: data?.selected_regulation,
      analysis: data?.reasoning,
    };

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error('Step 1 GET API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
