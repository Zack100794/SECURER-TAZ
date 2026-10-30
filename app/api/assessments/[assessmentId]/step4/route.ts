import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm/client';
import { SYSTEM_PROMPT, createStep4Prompt, Step4ResponseSchema } from '@/lib/llm/prompts/step4';

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

    // Get test specifications from Step 3
    const { data: testSpecs, error: specsError } = await supabase
      .from('step3_test_specifications')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (specsError || !testSpecs || testSpecs.length === 0) {
      return NextResponse.json(
        { error: 'No test specifications found' },
        { status: 400 }
      );
    }

    // Get uploaded files
    const { data: files, error: filesError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('uploaded_at', { ascending: false });

    if (filesError || !files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Use the most recently uploaded file
    const latestFile = files[0];
    const codeContext = latestFile.file_path;
    const detectedLanguage = latestFile.file_type;

    // Format test specifications for LLM
    const formattedSpecs = testSpecs.slice(0, 10).map((spec) => ({
      testId: spec.test_id,
      testDescription: spec.test_description,
      expectedOutcome: spec.expected_outcome,
    }));

    // Generate test cases using LLM
    const prompt = createStep4Prompt(formattedSpecs, codeContext, detectedLanguage);
    const llmResponse = await llm.generateStructured(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      Step4ResponseSchema,
      { temperature: 0.7, maxTokens: 4000 }
    );

    if (!llmResponse.parsed) {
      return NextResponse.json(
        { error: 'Failed to generate test cases' },
        { status: 500 }
      );
    }

    // Delete existing test cases
    await supabase
      .from('step4_test_cases')
      .delete()
      .eq('assessment_id', assessmentId);

    // Save test cases to database
    const testCasesToInsert = llmResponse.parsed.testCases.map((testCase, index) => ({
      assessment_id: assessmentId,
      test_spec_id: testSpecs[index]?.id || testSpecs[0].id,
      test_case_name: testCase.name,
      test_code: testCase.code,
      programming_language: testCase.language,
      file_path: null,
    }));

    const { error: insertError } = await supabase
      .from('step4_test_cases')
      .insert(testCasesToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fetch the saved test cases with IDs
    const { data: savedTestCases } = await supabase
      .from('step4_test_cases')
      .select('*')
      .eq('assessment_id', assessmentId);

    // Transform to frontend format
    const transformedTestCases = savedTestCases?.map((tc: any) => ({
      id: tc.id,
      test_case_id: tc.id,
      title: tc.test_case_name,
      description: tc.test_case_name,
      code: tc.test_code,
      language: tc.programming_language,
      dependencies: [],
      setup_instructions: '',
    })) || [];

    return NextResponse.json({
      test_cases: transformedTestCases,
      language: llmResponse.parsed.language,
      total_tests: llmResponse.parsed.totalTests,
    });
  } catch (error: any) {
    console.error('Step 4 API error:', error);
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

    // Get test cases
    const { data: testCases, error: testError } = await supabase
      .from('step4_test_cases')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (testError) {
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }

    // Get uploaded files
    const { data: files } = await supabase
      .from('uploaded_files')
      .select('id, file_name, file_type, file_size, uploaded_at')
      .eq('assessment_id', assessmentId)
      .order('uploaded_at', { ascending: false });

    // Transform test cases to frontend format
    const transformedTestCases = testCases?.map((tc: any) => ({
      id: tc.id,
      test_case_id: tc.id,
      title: tc.test_case_name,
      description: tc.test_case_name,
      code: tc.test_code,
      language: tc.programming_language,
      dependencies: [],
      setup_instructions: '',
    })) || [];

    return NextResponse.json({ 
      test_cases: transformedTestCases,
      uploaded_files: files || [],
    });
  } catch (error: any) {
    console.error('Step 4 GET API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
