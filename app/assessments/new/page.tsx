'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NewAssessmentPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: assessment, error: insertError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          name,
          current_step: 0,
          status: 'in_progress',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to questionnaire
      router.push(`/assessments/${assessment.id}/questionnaire`);
    } catch (error: any) {
      setError(error.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Securer</span>
            </Link>
            <Link
              href="/assessments"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Back to Assessments
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Assessment
          </h1>
          <p className="text-gray-600 mb-8">
            Start a new cybersecurity compliance assessment for your smart home system
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="assessment-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Assessment Name
              </label>
              <input
                id="assessment-name"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Smart Home Security Assessment 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                Choose a descriptive name to help you identify this assessment later
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Assessment'}
              </button>
              <Link
                href="/assessments"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
