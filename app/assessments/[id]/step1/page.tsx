'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';

interface Regulation {
  regulation: string;
  relevance_score: number;
  reasoning: string;
  key_requirements: string[];
}

export default function Step1Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrGenerateRegulations();
  }, []);

  const loadOrGenerateRegulations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load existing results
      const getResponse = await fetch(`/api/assessments/${id}/step1`);
      const getData = await getResponse.json();

      if (getData.regulations && getData.regulations.length > 0) {
        setRegulations(getData.regulations);
        if (getData.selected_regulation) {
          setSelectedRegulation(getData.selected_regulation);
        }
        return;
      }

      // Generate new analysis
      const postResponse = await fetch(`/api/assessments/${id}/step1`, {
        method: 'POST',
      });
      const postData = await postResponse.json();

      if (postData.error) {
        setError(postData.error);
      } else {
        setRegulations(postData.regulations || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRegulation = async () => {
    if (!selectedRegulation) {
      setError('Please select a regulation');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${id}/step1/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulation: selectedRegulation }),
      });

      if (!response.ok) {
        throw new Error('Failed to save selection');
      }

      router.push(`/assessments/${id}/step2`);
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
        <p className="mt-4 text-gray-600">Analyzing regulations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Step 1: Regulation Analysis</h1>
          <p className="text-gray-700 font-medium mt-2">
            Select the most relevant regulation for your software
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 mb-8">
          {regulations.map((reg, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                selectedRegulation === reg.regulation
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setSelectedRegulation(reg.regulation)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedRegulation === reg.regulation}
                      onChange={() => setSelectedRegulation(reg.regulation)}
                      className="w-5 h-5 text-blue-600 mt-1"
                    />
                    <div>
                      <CardTitle className="text-xl">{reg.regulation}</CardTitle>
                      <Badge variant="default" className="mt-2">
                        Relevance: {Math.round(reg.relevance_score * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reasoning</h3>
                    <p className="text-gray-800">{reg.reasoning}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Key Requirements</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-800">
                      {reg.key_requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/assessments/${id}/questionnaire`)}
          >
            Back to Questionnaire
          </Button>
          <Button onClick={handleSelectRegulation} disabled={submitting || !selectedRegulation}>
            {submitting ? 'Saving...' : 'Continue to Requirements'}
          </Button>
        </div>
      </div>
    </div>
  );
}
