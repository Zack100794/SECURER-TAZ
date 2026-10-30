'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';

interface TestSpecification {
  id: string;
  test_id: string;
  title: string;
  description: string;
  test_type: string;
  preconditions: string[];
  test_steps: string[];
  expected_results: string[];
  requirement_id: string;
}

export default function Step3Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [specifications, setSpecifications] = useState<TestSpecification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrGenerateSpecifications();
  }, []);

  const loadOrGenerateSpecifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const getResponse = await fetch(`/api/assessments/${id}/step3`);
      const getData = await getResponse.json();

      if (getData.specifications && getData.specifications.length > 0) {
        setSpecifications(getData.specifications);
        return;
      }

      const postResponse = await fetch(`/api/assessments/${id}/step3`, {
        method: 'POST',
      });
      const postData = await postResponse.json();

      if (postData.error) {
        setError(postData.error);
      } else {
        setSpecifications(postData.specifications || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${id}/step3/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm specifications');
      }

      router.push(`/assessments/${id}/step4`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Generating test specifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Step 3: Test Specifications</h1>
          <p className="text-gray-700 font-medium mt-2">
            Review the formal test specifications generated from your requirements
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 mb-8">
          {specifications.map((spec) => (
            <Card key={spec.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{spec.title}</CardTitle>
                  <span className="text-sm text-gray-500 font-mono">{spec.test_id}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Type: {spec.test_type} | Requirement: {spec.requirement_id}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{spec.description}</p>
                  </div>

                  {spec.preconditions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Preconditions</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-800">
                        {spec.preconditions.map((pre, idx) => (
                          <li key={idx}>{pre}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Test Steps</h3>
                    <ol className="list-decimal list-inside space-y-1 text-gray-800">
                      {spec.test_steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expected Results</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                      {spec.expected_results.map((result, idx) => (
                        <li key={idx}>{result}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/assessments/${id}/step2`)}>
            Back to Requirements
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Confirming...' : 'Continue to Test Generation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
