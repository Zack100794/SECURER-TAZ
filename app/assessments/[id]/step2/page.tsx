'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';

interface Requirement {
  id: string;
  requirement_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  is_selected: boolean;
}

export default function Step2Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrGenerateRequirements();
  }, []);

  const loadOrGenerateRequirements = async () => {
    setLoading(true);
    setError(null);

    try {
      const getResponse = await fetch(`/api/assessments/${id}/step2`);
      const getData = await getResponse.json();

      if (getData.requirements && getData.requirements.length > 0) {
        setRequirements(getData.requirements);
        const selected = new Set<string>(
          getData.requirements.filter((r: Requirement) => r.is_selected).map((r: Requirement) => r.id)
        );
        setSelectedIds(selected);
        return;
      }

      const postResponse = await fetch(`/api/assessments/${id}/step2`, {
        method: 'POST',
      });
      const postData = await postResponse.json();

      if (postData.error) {
        setError(postData.error);
      } else {
        setRequirements(postData.requirements || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRequirement = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleContinue = async () => {
    if (selectedIds.size === 0) {
      setError('Please select at least one requirement');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${id}/step2/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement_ids: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        throw new Error('Failed to save selection');
      }

      router.push(`/assessments/${id}/step3`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.category]) acc[req.category] = [];
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, Requirement[]>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Extracting requirements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Step 2: Requirements Selection</h1>
          <p className="text-gray-700 font-medium mt-2">
            Select the requirements you want to test ({selectedIds.size} selected)
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 mb-8">
          {Object.entries(groupedRequirements).map(([category, reqs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reqs.map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedIds.has(req.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => toggleRequirement(req.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(req.id)}
                          onChange={() => toggleRequirement(req.id)}
                          className="w-5 h-5 text-blue-600 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{req.title}</h3>
                            <Badge
                              variant={
                                req.priority === 'Critical'
                                  ? 'destructive'
                                  : req.priority === 'High'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {req.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 font-medium mb-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{req.requirement_id}</span>
                          </p>
                          <p className="text-gray-800">{req.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/assessments/${id}/step1`)}>
            Back to Regulations
          </Button>
          <Button onClick={handleContinue} disabled={submitting || selectedIds.size === 0}>
            {submitting ? 'Saving...' : 'Continue to Test Specifications'}
          </Button>
        </div>
      </div>
    </div>
  );
}
