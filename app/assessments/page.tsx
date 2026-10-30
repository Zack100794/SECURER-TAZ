import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, FileText, Clock } from 'lucide-react';

export default async function AssessmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch user's assessments
  const { data: assessments, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assessments:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Securer</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
          <Link
            href="/assessments/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            <PlusCircle className="h-5 w-5" />
            New Assessment
          </Link>
        </div>

        {assessments && assessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      assessment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : assessment.status === 'archived'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {assessment.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {assessment.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(assessment.created_at).toLocaleDateString()}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">
                      Step {assessment.current_step} of 5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(assessment.current_step / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={
                    assessment.status === 'completed'
                      ? `/assessments/${assessment.id}/step5`
                      : assessment.current_step === 0
                      ? `/assessments/${assessment.id}/questionnaire`
                      : `/assessments/${assessment.id}/step${assessment.current_step}`
                  }
                  className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium"
                >
                  {assessment.status === 'completed' ? 'View Report' : 'Continue'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No assessments yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first cybersecurity compliance assessment to get started
            </p>
            <Link
              href="/assessments/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              <PlusCircle className="h-5 w-5" />
              Create Assessment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
