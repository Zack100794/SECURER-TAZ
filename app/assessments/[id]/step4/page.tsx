'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';

interface TestCase {
  id: string;
  test_case_id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  dependencies: string[];
  setup_instructions: string;
}

export default function Step4Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestCases();
  }, []);

  const loadTestCases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assessments/${id}/step4`);
      const data = await response.json();

      if (!data.error) {
        setTestCases(data.test_cases || []);
        setUploadedFiles(data.uploaded_files || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assessment_id', id);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      await loadTestCases();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload code files first');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${id}/step4`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setTestCases(data.test_cases || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (testCaseId: string, title: string, language: string) => {
    try {
      const response = await fetch(
        `/api/assessments/${id}/step4/download/${testCaseId}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'txt';
      a.download = `${title.replace(/\s+/g, '_')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(`Failed to download: ${err.message}`);
    }
  };

  const handleContinue = () => {
    if (testCases.length === 0) {
      setError('Please generate test cases first');
      return;
    }
    router.push(`/assessments/${id}/step5`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading test cases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Step 4: Test Generation</h1>
          <p className="text-gray-700 font-medium mt-2">
            Upload your code and generate executable test cases
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Source Code</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              multiple
              accept=".py,.js,.ts,.java,.cpp,.c,.cs,.go,.rb,.php"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Uploaded Files ({uploadedFiles.length})</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.file_name}</span>
                      <Badge>{file.language}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerateTests}
              disabled={generating || uploadedFiles.length === 0}
              className="mt-4"
            >
              {generating ? 'Generating Tests...' : 'Generate Test Cases'}
            </Button>
          </CardContent>
        </Card>

        {testCases.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold">Generated Test Cases</h2>
            {testCases.map((testCase) => (
              <Card key={testCase.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{testCase.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge>{testCase.language}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownload(testCase.id, testCase.title, testCase.language)
                        }
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{testCase.test_case_id}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{testCase.description}</p>
                    </div>

                    {testCase.dependencies.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Dependencies</h3>
                        <div className="flex flex-wrap gap-2">
                          {testCase.dependencies.map((dep, idx) => (
                            <Badge key={idx} variant="secondary">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {testCase.setup_instructions && (
                      <div>
                        <h3 className="font-semibold mb-2">Setup Instructions</h3>
                        <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                          {testCase.setup_instructions}
                        </pre>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-2">Code</h3>
                      <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                        <code>{testCase.code}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/assessments/${id}/step3`)}>
            Back to Specifications
          </Button>
          <Button onClick={handleContinue} disabled={testCases.length === 0}>
            Continue to Vulnerability Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
