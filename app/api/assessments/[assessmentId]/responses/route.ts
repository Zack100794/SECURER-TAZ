import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
    const { responses } = body; // Array of { question_id, response_value }

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

    // Delete existing responses for this assessment
    await supabase
      .from('questionnaire_responses')
      .delete()
      .eq('assessment_id', assessmentId);

    // Insert new responses
    const responsesToInsert = responses.map((r: any) => ({
      assessment_id: assessmentId,
      question_id: r.question_id,
      response_value: r.response_value,
    }));

    const { error: insertError } = await supabase
      .from('questionnaire_responses')
      .insert(responsesToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update assessment to step 1
    await supabase
      .from('assessments')
      .update({ current_step: 1 })
      .eq('id', assessmentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Submit responses API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
