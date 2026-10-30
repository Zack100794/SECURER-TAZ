'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';

interface TestResult {
  test_case_id: string;
  status: 'passed' | 'failed';
  execution_time_ms: number;
  error_message?: string;
  output?: string;
}

interface FinalReport {
  markdown_report: string;
  created_at: string;
}

export default function Step5Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/assessments/${id}/step5`);
      const data = await response.json();

      if (!data.error && data.report) {
        setReport(data.report);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestResult = () => {
    setTestResults([
      ...testResults,
      {
        test_case_id: '',
        status: 'passed',
        execution_time_ms: 0,
        output: '',
      },
    ]);
  };

  const handleResultChange = (index: number, field: keyof TestResult, value: any) => {
    const updated = [...testResults];
    updated[index] = { ...updated[index], [field]: value };
    setTestResults(updated);
  };

  const handleRemoveResult = (index: number) => {
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (testResults.length === 0) {
      setError('Please add at least one test result');
      return;
    }

    const incomplete = testResults.some((r) => !r.test_case_id);
    if (incomplete) {
      setError('Please fill in all test case IDs');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${id}/step5`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_results: testResults }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setReport(data.report);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const blob = new Blob([report.markdown_report], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${id}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleComplete = () => {
    router.push('/assessments');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading report...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Step 5: Vulnerability Analysis</h1>
          <p className="text-gray-700 font-medium mt-2">
            Upload test results and generate final compliance report
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!report && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Result {index + 1}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveResult(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Test Case ID</label>
                        <input
                          type="text"
                          value={result.test_case_id}
                          onChange={(e) =>
                            handleResultChange(index, 'test_case_id', e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded"
                          placeholder="e.g., TC-001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                          value={result.status}
                          onChange={(e) => handleResultChange(index, 'status', e.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Execution Time (ms)
                        </label>
                        <input
                          type="number"
                          value={result.execution_time_ms}
                          onChange={(e) =>
                            handleResultChange(index, 'execution_time_ms', parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>

                      {result.status === 'failed' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Error Message</label>
                          <input
                            type="text"
                            value={result.error_message || ''}
                            onChange={(e) =>
                              handleResultChange(index, 'error_message', e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Output (optional)</label>
                      <textarea
                        value={result.output || ''}
                        onChange={(e) => handleResultChange(index, 'output', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={handleAddTestResult} className="w-full">
                  Add Test Result
                </Button>

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || testResults.length === 0}
                  className="w-full"
                >
                  {analyzing ? 'Analyzing...' : 'Generate Final Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {report && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Compliance Report</CardTitle>
                  <Button variant="outline" onClick={handleDownloadReport}>
                    Download Report
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Generated on {new Date(report.created_at).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap bg-white p-6 rounded-lg border">
                    {report.markdown_report}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Alert variant="default">
              <AlertDescription>
                <strong>Assessment Complete!</strong> Your compliance assessment has been finished.
                You can download the report above or return to the dashboard.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessments/${id}/step4`)}
            disabled={!!report}
          >
            Back to Test Generation
          </Button>
          <Button onClick={handleComplete}>
            {report ? 'Return to Dashboard' : 'Save & Exit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
