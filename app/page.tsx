import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Shield, Lock, FileCheck, Zap } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Securer</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/assessments"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            Cybersecurity Compliance
            <span className="text-blue-600"> Made Simple</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Automated compliance assessment for smart home systems. Get regulation recommendations,
            generate test cases, and receive comprehensive security reports.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {user ? (
              <Link
                href="/assessments"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Start Free Assessment
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <FileCheck className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">1. Questionnaire</h3>
              <p className="mt-2 text-gray-500">
                Answer questions about your smart home system requirements
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">2. Regulation Analysis</h3>
              <p className="mt-2 text-gray-500">
                Get AI-powered recommendations for relevant cybersecurity standards
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">3. Test Generation</h3>
              <p className="mt-2 text-gray-500">
                Automated test case generation from your code
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">4. Compliance Report</h3>
              <p className="mt-2 text-gray-500">
                Comprehensive security assessment with actionable recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
