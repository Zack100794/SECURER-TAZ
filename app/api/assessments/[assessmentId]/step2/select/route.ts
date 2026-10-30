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
    const { requirement_ids, selectedRequirementIds } = body;
    const requirementIds = requirement_ids || selectedRequirementIds || [];

    // Update selected requirements
    await supabase
      .from('step2_requirements')
      .update({ is_selected: false })
      .eq('assessment_id', assessmentId);

    if (requirementIds.length > 0) {
      await supabase
        .from('step2_requirements')
        .update({ is_selected: true })
        .in('id', requirementIds);
    }

    // Update assessment to step 3
    await supabase
      .from('assessments')
      .update({ current_step: 3 })
      .eq('id', assessmentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Select requirements API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
