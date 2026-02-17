import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FileText, Mail, ExternalLink, User } from 'lucide-react';
import type { ApplicationWithDetails } from '../types/database';

interface JobApplicationsProps {
  jobId: string;
}

export function JobApplications({ jobId }: JobApplicationsProps) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*, companies(*)), profiles(*)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const job = data[0]?.jobs;
      if (job && job.employer_id !== user?.id) {
        alert('Unauthorized');
        window.location.href = '/employer/dashboard';
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: 'Accepted' | 'Rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application status');
    }
  };

  const viewDetails = (app: ApplicationWithDetails) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
          {applications.length > 0 && applications[0].jobs && (
            <p className="text-gray-600">
              {applications[0].jobs.title} at {applications[0].jobs.companies.company_name}
            </p>
          )}
          <p className="text-gray-600 mt-2">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </p>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-600 text-lg">No applications yet</p>
                <p className="text-gray-500 mt-2">
                  Applications will appear here once developers apply
                </p>
              </CardContent>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.profiles.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">{app.profiles.email}</p>
                        </div>
                      </div>

                      {app.profiles.skills && app.profiles.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {app.profiles.skills.map((skill) => (
                            <Badge key={skill} variant="info">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {app.cover_letter && (
                        <p className="text-gray-700 line-clamp-2 mb-3">
                          {app.cover_letter}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Applied{' '}
                          {new Date(app.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
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
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => viewDetails(app)}>
                        View Details
                      </Button>
                      {app.status === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateApplicationStatus(app.id, 'Accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedApp && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Application Details"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Applicant</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedApp.profiles.full_name}
                  </p>
                  <a
                    href={`mailto:${selectedApp.profiles.email}`}
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    {selectedApp.profiles.email}
                  </a>
                </div>
              </div>

              {selectedApp.profiles.portfolio_url && (
                <a
                  href={selectedApp.profiles.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Portfolio
                </a>
              )}
            </div>

            {selectedApp.profiles.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                <p className="text-gray-700">{selectedApp.profiles.bio}</p>
              </div>
            )}

            {selectedApp.profiles.skills && selectedApp.profiles.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.profiles.skills.map((skill) => (
                    <Badge key={skill} variant="info">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedApp.cover_letter && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedApp.cover_letter}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume</h3>
              <a
                href={selectedApp.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FileText className="w-5 h-5" />
                View Resume
              </a>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
              <Badge
                variant={
                  selectedApp.status === 'Accepted'
                    ? 'success'
                    : selectedApp.status === 'Rejected'
                    ? 'danger'
                    : 'warning'
                }
              >
                {selectedApp.status}
              </Badge>
            </div>

            {selectedApp.status === 'Pending' && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    updateApplicationStatus(selectedApp.id, 'Accepted');
                    setShowModal(false);
                  }}
                  className="flex-1"
                >
                  Accept Application
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    updateApplicationStatus(selectedApp.id, 'Rejected');
                    setShowModal(false);
                  }}
                  className="flex-1"
                >
                  Reject Application
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
