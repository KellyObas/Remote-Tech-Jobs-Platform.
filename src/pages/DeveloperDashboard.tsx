import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Briefcase, Bookmark as BookmarkIcon, User, FileText } from 'lucide-react';
import type { ApplicationWithDetails, JobWithCompany } from '../types/database';

export function DeveloperDashboard() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [applicationsResult, bookmarksResult] = await Promise.all([
        supabase
          .from('applications')
          .select('*, jobs(*, companies(*)), profiles(*)')
          .eq('developer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('bookmarks')
          .select('*, jobs(*, companies(*))')
          .eq('developer_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (applicationsResult.error) throw applicationsResult.error;
      if (bookmarksResult.error) throw bookmarksResult.error;

      setApplications(applicationsResult.data || []);
      setBookmarkedJobs(
        bookmarksResult.data?.map((b: { jobs: JobWithCompany }) => b.jobs) || []
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalApplications: applications.length,
    pending: applications.filter((a) => a.status === 'Pending').length,
    accepted: applications.filter((a) => a.status === 'Accepted').length,
    bookmarks: bookmarkedJobs.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {profile?.full_name || 'Developer'}
            </p>
          </div>
          <Button onClick={() => (window.location.href = '/developer/profile')}>
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.accepted}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bookmarks</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.bookmarks}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BookmarkIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => (window.location.href = '/jobs')}
              >
                Browse Jobs
              </Button>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No applications yet</p>
                <Button onClick={() => (window.location.href = '/jobs')}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <a
                          href={`/jobs/${app.job_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {app.jobs.title}
                        </a>
                        <p className="text-sm text-gray-600">
                          {app.jobs.companies.company_name}
                        </p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'Accepted'
                            ? 'success'
                            : app.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600">
                      Applied{' '}
                      {new Date(app.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Bookmarked Jobs</h2>
            </div>

            {bookmarkedJobs.length === 0 ? (
              <div className="p-12 text-center">
                <BookmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No bookmarked jobs yet</p>
                <Button onClick={() => (window.location.href = '/jobs')}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {bookmarkedJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <a
                      href={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 block mb-1"
                    >
                      {job.title}
                    </a>
                    <p className="text-sm text-gray-600 mb-2">
                      {job.companies.company_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">{job.employment_type}</Badge>
                      <Badge variant="default">{job.experience_level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
