import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TextArea } from '../components/ui/TextArea';
import { MapPin, DollarSign, Clock, Globe, Briefcase, CheckCircle } from 'lucide-react';
import type { JobWithCompany } from '../types/database';

interface JobDetailProps {
  jobId: string;
}

export function JobDetail({ jobId }: JobDetailProps) {
  const { user, profile } = useAuth();
  const [job, setJob] = useState<JobWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    fetchJob();
    if (user && profile?.role === 'developer') {
      checkApplication();
    }
  }, [jobId, user, profile]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(*)')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('developer_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setHasApplied(!!data);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleApply = async () => {
    if (!user || !resumeUrl) return;

    setApplying(true);
    try {
      const { error } = await supabase.from('applications').insert({
        job_id: jobId,
        developer_id: user.id,
        resume_url: resumeUrl,
        cover_letter: coverLetter || null,
      });

      if (error) throw error;

      setHasApplied(true);
      setShowApplyModal(false);
      setCoverLetter('');
      setResumeUrl('');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Job not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                {job.companies.logo_url ? (
                  <img
                    src={job.companies.logo_url}
                    alt={job.companies.company_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-2xl">
                      {job.companies.company_name.charAt(0)}
                    </span>
                  </div>
                )}

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-xl text-gray-600 mt-1">{job.companies.company_name}</p>
                </div>
              </div>

              <Badge variant={job.status === 'Open' ? 'success' : 'danger'}>
                {job.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center text-gray-700">
                <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                {job.salary_range}
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                Remote
              </div>
              <div className="flex items-center text-gray-700">
                <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                {job.employment_type}
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                {job.experience_level}
              </div>
              {job.timezone && (
                <div className="flex items-center text-gray-700">
                  <Globe className="w-5 h-5 mr-2 text-gray-400" />
                  {job.timezone}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Role</h2>
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {job.tech_stack.map((tech) => (
                  <Badge key={tech} variant="info">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {job.companies.website && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company</h2>
                <a
                  href={job.companies.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {job.companies.website}
                </a>
                {job.companies.description && (
                  <p className="text-gray-700 mt-2">{job.companies.description}</p>
                )}
              </div>
            )}

            {profile?.role === 'developer' && job.status === 'Open' && (
              <div className="pt-6 border-t border-gray-200">
                {hasApplied ? (
                  <div className="flex items-center justify-center py-4 text-green-600">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    <span className="font-medium">You have applied to this job</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowApplyModal(true)}
                    className="w-full"
                    size="lg"
                  >
                    Apply for this Position
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for Position"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resume URL *
            </label>
            <input
              type="url"
              placeholder="https://example.com/resume.pdf"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Provide a link to your resume (PDF, Google Drive, Dropbox, etc.)
            </p>
          </div>

          <TextArea
            label="Cover Letter (Optional)"
            placeholder="Tell the employer why you're a great fit for this role..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowApplyModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              loading={applying}
              disabled={!resumeUrl}
              className="flex-1"
            >
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
