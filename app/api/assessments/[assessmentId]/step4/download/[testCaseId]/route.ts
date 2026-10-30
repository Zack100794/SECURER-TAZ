import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string; testCaseId: string }> }
) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId, testCaseId } = await params;

    const { data: testCase, error } = await supabase
      .from('step4_test_cases')
      .select('*')
      .eq('id', testCaseId)
      .single();

    if (error || !testCase) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }

    // Create a downloadable file
    const fileExtensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      csharp: 'cs',
      ruby: 'rb',
      go: 'go',
    };

    const extension = fileExtensions[testCase.programming_language] || 'txt';
    const fileName = `${testCase.test_case_name.replace(/[^a-z0-9]/gi, '_')}.${extension}`;

    return new NextResponse(testCase.test_code, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Download test case API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
