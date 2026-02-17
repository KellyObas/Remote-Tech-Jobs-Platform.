import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Briefcase, Search, Users, Zap } from 'lucide-react';

export function Home() {
  const { user, profile } = useAuth();

  if (user && profile) {
    window.location.href =
      profile.role === 'developer' ? '/developer/dashboard' : '/employer/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Next
            <span className="text-blue-600"> Remote Tech Job</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect talented developers with amazing remote opportunities from companies
            around the world.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/signup">
              <Button size="lg">Get Started</Button>
            </a>
            <a href="/jobs">
              <Button size="lg" variant="secondary">
                Browse Jobs
              </Button>
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Jobs</h3>
            <p className="text-gray-600">
              Browse hundreds of remote tech positions with advanced filtering and search.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Apply</h3>
            <p className="text-gray-600">
              Apply to multiple jobs with your profile and track all applications in one
              place.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Talent</h3>
            <p className="text-gray-600">
              Post jobs and connect with qualified developers looking for remote
              opportunities.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Developers</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Access to curated remote tech positions
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Filter by tech stack, experience level, and salary
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Track all your applications in one dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Bookmark jobs and apply with ease
                </li>
              </ul>
              <a href="/signup" className="inline-block mt-6">
                <Button>Sign Up as Developer</Button>
              </a>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Employers</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Post unlimited remote job positions
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Manage applications from a centralized dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Review developer profiles and portfolios
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Accept or reject applications with one click
                </li>
              </ul>
              <a href="/signup" className="inline-block mt-6">
                <Button>Sign Up as Employer</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
