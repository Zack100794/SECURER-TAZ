import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get questionnaire with questions
    const { data: questionnaire, error: qError } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('id', id)
      .single();

    if (qError) {
      return NextResponse.json({ error: qError.message }, { status: 500 });
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('questionnaire_id', id)
      .order('display_order', { ascending: true });

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 });
    }

    return NextResponse.json({ questionnaire, questions });
  } catch (error: any) {
    console.error('Questionnaire detail API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
