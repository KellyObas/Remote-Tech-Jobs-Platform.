import { MapPin, Clock, DollarSign, Bookmark } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import type { JobWithCompany } from '../types/database';

interface JobCardProps {
  job: JobWithCompany;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export function JobCard({ job, onBookmark, isBookmarked }: JobCardProps) {
  const timeAgo = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            {job.companies.logo_url ? (
              <img
                src={job.companies.logo_url}
                alt={job.companies.company_name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {job.companies.company_name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1">
              <a
                href={`/jobs/${job.id}`}
                className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {job.title}
              </a>
              <p className="text-gray-600 mt-1">{job.companies.company_name}</p>
            </div>
          </div>

          {onBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onBookmark();
              }}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.tech_stack.slice(0, 5).map((tech) => (
            <Badge key={tech} variant="info">
              {tech}
            </Badge>
          ))}
          {job.tech_stack.length > 5 && (
            <Badge variant="default">+{job.tech_stack.length - 5} more</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {job.salary_range}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Remote
          </div>
          <Badge variant={job.experience_level === 'Senior' ? 'warning' : 'default'}>
            {job.experience_level}
          </Badge>
          <Badge variant="default">{job.employment_type}</Badge>
          <div className="flex items-center ml-auto">
            <Clock className="w-4 h-4 mr-1" />
            {timeAgo}
          </div>
        </div>

        {job.status === 'Closed' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Badge variant="danger">Closed</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
