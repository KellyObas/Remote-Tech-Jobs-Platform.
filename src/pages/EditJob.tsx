import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { X } from 'lucide-react';
import type { Job } from '../types/database';

const TECH_STACK_OPTIONS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'Go', 'Rust',
  'Java', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Vue.js', 'Angular',
  'Django', 'Flask', 'Express', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker',
  'Kubernetes', 'GraphQL', 'Next.js', 'Tailwind CSS', 'Redis', 'Elasticsearch'
];

interface EditJobProps {
  jobId: string;
}

export function EditJob({ jobId }: EditJobProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tech_stack: [] as string[],
    experience_level: 'Mid' as 'Junior' | 'Mid' | 'Senior',
    salary_range: '',
    employment_type: 'Full-time' as 'Full-time' | 'Contract' | 'Internship',
    timezone: '',
    status: 'Open' as 'Open' | 'Closed',
  });

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      if (data.employer_id !== user?.id) {
        alert('Unauthorized');
        window.location.href = '/employer/dashboard';
        return;
      }

      setJob(data);
      setFormData({
        title: data.title,
        description: data.description,
        tech_stack: data.tech_stack,
        experience_level: data.experience_level,
        salary_range: data.salary_range,
        employment_type: data.employment_type,
        timezone: data.timezone || '',
        status: data.status,
      });
    } catch (error) {
      console.error('Error fetching job:', error);
    }
  };

  const addTechStack = (tech: string) => {
    const trimmedTech = tech.trim();
    if (trimmedTech && !formData.tech_stack.includes(trimmedTech)) {
      setFormData({
        ...formData,
        tech_stack: [...formData.tech_stack, trimmedTech],
      });
    }
    setTechInput('');
  };

  const removeTechStack = (tech: string) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter((t) => t !== tech),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.tech_stack.length === 0) {
      alert('Please add at least one technology');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .update(formData)
        .eq('id', jobId);

      if (error) throw error;

      alert('Job updated successfully!');
      window.location.href = '/employer/dashboard';
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);

      if (error) throw error;

      alert('Job deleted successfully!');
      window.location.href = '/employer/dashboard';
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              Delete Job
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Job Title *"
              type="text"
              placeholder="e.g. Senior React Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextArea
              label="Job Description *"
              placeholder="Describe the role, responsibilities, requirements, and what makes your company great..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tech Stack *
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={techInput}
                  onChange={(e) => {
                    setTechInput(e.target.value);
                    if (e.target.value) {
                      addTechStack(e.target.value);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a technology...</option>
                  {TECH_STACK_OPTIONS.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tech_stack.map((tech) => (
                  <Badge key={tech} variant="info" className="flex items-center gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechStack(tech)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Experience Level *"
                value={formData.experience_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience_level: e.target.value as 'Junior' | 'Mid' | 'Senior',
                  })
                }
                options={[
                  { value: 'Junior', label: 'Junior' },
                  { value: 'Mid', label: 'Mid' },
                  { value: 'Senior', label: 'Senior' },
                ]}
              />

              <Select
                label="Employment Type *"
                value={formData.employment_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employment_type: e.target.value as
                      | 'Full-time'
                      | 'Contract'
                      | 'Internship',
                  })
                }
                options={[
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Internship', label: 'Internship' },
                ]}
              />
            </div>

            <Input
              label="Salary Range *"
              type="text"
              placeholder="e.g. $80,000 - $120,000"
              value={formData.salary_range}
              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
              required
            />

            <Input
              label="Timezone Requirement (Optional)"
              type="text"
              placeholder="e.g. EST, PST, UTC+0, or 'Any'"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            />

            <Select
              label="Status *"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as 'Open' | 'Closed' })
              }
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => (window.location.href = '/employer/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Update Job
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
