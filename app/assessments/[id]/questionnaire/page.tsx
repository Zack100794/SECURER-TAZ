'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';

interface Question {
  id: string;
  section_title: string;
  question_number: number;
  question_text: string;
  input_type: string;
  options: string[] | null;
  is_required: boolean;
}

export default function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      // Get first questionnaire
      const qResponse = await fetch('/api/questionnaires');
      const qData = await qResponse.json();
      
      if (!qData.questionnaires || qData.questionnaires.length === 0) {
        setError('No questionnaire available');
        return;
      }

      const questionnaireId = qData.questionnaires[0].id;

      // Get questions
      const response = await fetch(`/api/questionnaires/${questionnaireId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setQuestions(data.questions || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [...new Set(questions.map((q) => q.section_title))];
  const currentQuestions = questions.filter(
    (q) => q.section_title === sections[currentSection]
  );

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    const current = responses[questionId] || '';
    const values = current ? current.split(',') : [];
    
    if (checked) {
      values.push(value);
    } else {
      const index = values.indexOf(value);
      if (index > -1) values.splice(index, 1);
    }
    
    setResponses((prev) => ({ ...prev, [questionId]: values.join(',') }));
  };

  const validateSection = () => {
    const requiredQuestions = currentQuestions.filter((q) => q.is_required);
    for (const q of requiredQuestions) {
      if (!responses[q.id] || responses[q.id].trim() === '') {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateSection()) {
      setError('Please answer all required questions');
      return;
    }
    setError(null);
    setCurrentSection((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentSection((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateSection()) {
      setError('Please answer all required questions');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formattedResponses = Object.entries(responses).map(([questionId, value]) => ({
        question_id: questionId,
        response_value: value,
      }));

      const response = await fetch(`/api/assessments/${id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: formattedResponses }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit responses');
      }

      // Navigate to Step 1
      router.push(`/assessments/${id}/step1`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Assessment Questionnaire</CardTitle>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Progress</span>
                <span className="font-semibold text-gray-900">
                  Section {currentSection + 1} of {sections.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <h2 className="text-xl font-bold text-gray-900 mb-6">{sections[currentSection]}</h2>

            <div className="space-y-6">
              {currentQuestions.map((question) => (
                <div key={question.id} className="border-b pb-6">
                  <label className="block font-semibold text-gray-900 text-base mb-3">
                    {question.question_number}. {question.question_text}
                    {question.is_required && <span className="text-red-600 ml-1">*</span>}
                  </label>

                  {question.input_type === 'radio' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label key={option} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={responses[question.id] === option}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.input_type === 'checkbox' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isChecked = (responses[question.id] || '').split(',').includes(option);
                        return (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                handleCheckboxChange(question.id, option, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-800">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {question.input_type === 'text' && (
                    <input
                      type="text"
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  )}

                  {question.input_type === 'textarea' && (
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSection === 0}
              >
                Previous
              </Button>
              
              {currentSection < sections.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Complete Questionnaire'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
