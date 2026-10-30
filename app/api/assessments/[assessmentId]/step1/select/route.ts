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
    const { regulation, selectedRegulation } = body;
    const regulationToSave = regulation || selectedRegulation;

    if (!regulationToSave) {
      return NextResponse.json({ error: 'No regulation provided' }, { status: 400 });
    }

    // Update selected regulation
    const { error } = await supabase
      .from('step1_regulation_analysis')
      .update({ selected_regulation: regulationToSave })
      .eq('assessment_id', assessmentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update assessment to step 2
    await supabase
      .from('assessments')
      .update({ current_step: 2 })
      .eq('id', assessmentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Select regulation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
