import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Briefcase, LogOut, User, Home, Plus } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">RemoteJobs</span>
              </a>

              {user && profile && (
                <div className="ml-10 flex items-center space-x-4">
                  {profile.role === 'developer' ? (
                    <>
                      <a
                        href="/developer/dashboard"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        <Home className="w-4 h-4 mr-1" />
                        Dashboard
                      </a>
                      <a
                        href="/jobs"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Browse Jobs
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href="/employer/dashboard"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        <Home className="w-4 h-4 mr-1" />
                        Dashboard
                      </a>
                      <a
                        href="/employer/create-job"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Post Job
                      </a>
                      <a
                        href="/employer/company"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Company
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user && profile ? (
                <>
                  <a
                    href={
                      profile.role === 'developer'
                        ? '/developer/profile'
                        : '/employer/company'
                    }
                    className="flex items-center text-gray-700 hover:text-blue-600"
                  >
                    <User className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{profile.full_name}</span>
                  </a>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <a href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </a>
                  <a href="/signup">
                    <Button size="sm">Get Started</Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 RemoteJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
