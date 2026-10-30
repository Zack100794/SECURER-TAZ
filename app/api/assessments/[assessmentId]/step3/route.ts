import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm/client';
import { SYSTEM_PROMPT, createStep3Prompt, Step3ResponseSchema } from '@/lib/llm/prompts/step3';

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

    // Get selected requirements from Step 2
    const { data: requirements, error: reqError } = await supabase
      .from('step2_requirements')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('is_selected', true);

    if (reqError || !requirements || requirements.length === 0) {
      return NextResponse.json(
        { error: 'No requirements selected in Step 2' },
        { status: 400 }
      );
    }

    // Format requirements for LLM
    const formattedRequirements = requirements.map((req) => ({
      id: req.id,
      text: req.requirement_text,
      category: req.category,
    }));

    // Generate test specifications using LLM
    const prompt = createStep3Prompt(formattedRequirements);
    const llmResponse = await llm.generateStructured(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      Step3ResponseSchema,
      { temperature: 0.7, maxTokens: 3000 }
    );

    if (!llmResponse.parsed) {
      return NextResponse.json(
        { error: 'Failed to generate test specifications' },
        { status: 500 }
      );
    }

    // Delete existing test specifications
    await supabase
      .from('step3_test_specifications')
      .delete()
      .eq('assessment_id', assessmentId);

    // Save test specifications to database
    const testSpecsToInsert = llmResponse.parsed.testSpecifications.map((spec, index) => ({
      assessment_id: assessmentId,
      requirement_id: requirements[index]?.id || requirements[0].id,
      test_id: spec.testId,
      test_description: spec.testDescription,
      expected_outcome: spec.expectedOutcome,
      test_method: spec.testMethod,
    }));

    const { error: insertError } = await supabase
      .from('step3_test_specifications')
      .insert(testSpecsToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch the saved specifications with IDs
    const { data: savedSpecs } = await supabase
      .from('step3_test_specifications')
      .select('*')
      .eq('assessment_id', assessmentId);

    // Transform to frontend format
    const transformedSpecs = savedSpecs?.map((spec: any) => ({
      id: spec.id,
      test_id: spec.test_id,
      title: spec.test_description.substring(0, 80), // First 80 chars as title
      description: spec.test_description,
      test_type: spec.test_method || 'manual',
      preconditions: [],
      test_steps: [],
      expected_results: [spec.expected_outcome],
      requirement_id: spec.requirement_id,
    })) || [];

    return NextResponse.json({
      specifications: transformedSpecs,
    });
  } catch (error: any) {
    console.error('Step 3 API error:', error);
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
      .from('step3_test_specifications')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to frontend format
    const transformedSpecs = data?.map((spec: any) => ({
      id: spec.id,
      test_id: spec.test_id,
      title: spec.test_description.substring(0, 80), // First 80 chars as title
      description: spec.test_description,
      test_type: spec.test_method || 'manual',
      preconditions: [],
      test_steps: [],
      expected_results: [spec.expected_outcome],
      requirement_id: spec.requirement_id,
    })) || [];

    return NextResponse.json({ specifications: transformedSpecs });
  } catch (error: any) {
    console.error('Step 3 GET API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
