import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { JobCard } from '../components/JobCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import type { JobWithCompany } from '../types/database';

const TECH_STACK_OPTIONS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'Go', 'Rust',
  'Java', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Vue.js', 'Angular',
  'Django', 'Flask', 'Express', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'
];

export function Jobs() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    experienceLevel: '',
    employmentType: '',
    techStack: '',
  });

  useEffect(() => {
    fetchJobs();
    if (profile?.role === 'developer') {
      fetchBookmarks();
    }
  }, [profile]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(*)')
        .eq('status', 'Open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('job_id')
        .eq('developer_id', user.id);

      if (error) throw error;
      setBookmarks(new Set(data?.map((b) => b.job_id) || []));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (jobId: string) => {
    if (!user || profile?.role !== 'developer') return;

    try {
      if (bookmarks.has(jobId)) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('job_id', jobId)
          .eq('developer_id', user.id);

        setBookmarks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await supabase
          .from('bookmarks')
          .insert({ job_id: jobId, developer_id: user.id });

        setBookmarks((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companies.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExperience =
      !filters.experienceLevel || job.experience_level === filters.experienceLevel;

    const matchesEmployment =
      !filters.employmentType || job.employment_type === filters.employmentType;

    const matchesTechStack =
      !filters.techStack || job.tech_stack.includes(filters.techStack);

    return matchesSearch && matchesExperience && matchesEmployment && matchesTechStack;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Remote Tech Jobs</h1>
          <p className="text-gray-600">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by job title, company, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Experience Level"
                value={filters.experienceLevel}
                onChange={(e) =>
                  setFilters({ ...filters, experienceLevel: e.target.value })
                }
                options={[
                  { value: '', label: 'All Levels' },
                  { value: 'Junior', label: 'Junior' },
                  { value: 'Mid', label: 'Mid' },
                  { value: 'Senior', label: 'Senior' },
                ]}
              />

              <Select
                label="Employment Type"
                value={filters.employmentType}
                onChange={(e) =>
                  setFilters({ ...filters, employmentType: e.target.value })
                }
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Internship', label: 'Internship' },
                ]}
              />

              <Select
                label="Tech Stack"
                value={filters.techStack}
                onChange={(e) => setFilters({ ...filters, techStack: e.target.value })}
                options={[
                  { value: '', label: 'All Technologies' },
                  ...TECH_STACK_OPTIONS.map((tech) => ({ value: tech, label: tech })),
                ]}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg">No jobs found matching your criteria</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onBookmark={
                  profile?.role === 'developer'
                    ? () => toggleBookmark(job.id)
                    : undefined
                }
                isBookmarked={bookmarks.has(job.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
