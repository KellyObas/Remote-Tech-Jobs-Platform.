import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { DeveloperProfile } from './pages/DeveloperProfile';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { CompanyProfile } from './pages/CompanyProfile';
import { CreateJob } from './pages/CreateJob';
import { EditJob } from './pages/EditJob';
import { JobApplications } from './pages/JobApplications';

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { loading } = useAuth();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const jobIdMatch = currentPath.match(/^\/jobs\/([^/]+)$/);
  const editJobMatch = currentPath.match(/^\/employer\/jobs\/([^/]+)\/edit$/);
  const applicationsMatch = currentPath.match(/^\/employer\/jobs\/([^/]+)\/applications$/);

  if (currentPath === '/signup') {
    return <SignUp />;
  }

  if (currentPath === '/login') {
    return <Login />;
  }

  if (currentPath === '/jobs' && jobIdMatch) {
    return (
      <Layout>
        <ProtectedRoute>
          <JobDetail jobId={jobIdMatch[1]} />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (jobIdMatch) {
    return (
      <Layout>
        <ProtectedRoute>
          <JobDetail jobId={jobIdMatch[1]} />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (currentPath === '/jobs') {
    return (
      <Layout>
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (currentPath === '/developer/dashboard') {
    return (
      <Layout>
        <ProtectedRoute requiredRole="developer">
          <DeveloperDashboard />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (currentPath === '/developer/profile') {
    return (
      <Layout>
        <ProtectedRoute requiredRole="developer">
          <DeveloperProfile />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (currentPath === '/employer/dashboard') {
    return (
      <Layout>
        <ProtectedRoute requiredRole="employer">
          <EmployerDashboard />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (currentPath === '/employer/company') {
    return (
      <Layout>
        <ProtectedRoute requiredRole="employer">
          <CompanyProfile />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (currentPath === '/employer/create-job') {
    return (
      <Layout>
        <ProtectedRoute requiredRole="employer">
          <CreateJob />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (editJobMatch) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="employer">
          <EditJob jobId={editJobMatch[1]} />
        </ProtectedRoute>
      </Layout>
    );
  }

  if (applicationsMatch) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="employer">
          <JobApplications jobId={applicationsMatch[1]} />
        </ProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout>
      <Home />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
