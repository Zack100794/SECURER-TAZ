import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assessmentId = (formData.get('assessmentId') || formData.get('assessment_id')) as string;

    if (!file || !assessmentId) {
      return NextResponse.json(
        { error: 'File and assessmentId required' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 50MB)' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/javascript',
      'text/javascript',
      'text/x-python',
      'application/x-python-code',
      'text/x-java',
      'text/x-c',
      'text/x-c++',
    ];

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const content = new TextDecoder().decode(arrayBuffer);

    // Simple file type detection based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'java': 'java',
      'c': 'c',
      'cpp': 'c++',
      'cs': 'csharp',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
    };

    const detectedLanguage = languageMap[extension || ''] || 'text';

    // Store file metadata in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('uploaded_files')
      .insert({
        assessment_id: assessmentId,
        file_name: file.name,
        file_path: content,
        file_type: detectedLanguage,
        file_size: file.size,
      })
      .select()
      .single();

    if (fileError) {
      return NextResponse.json({ error: fileError.message }, { status: 500 });
    }

    return NextResponse.json({
      fileId: fileRecord.id,
      fileName: file.name,
      language: detectedLanguage,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

