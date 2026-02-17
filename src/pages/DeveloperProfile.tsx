import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Badge } from '../components/ui/Badge';
import { X } from 'lucide-react';

const SKILLS_OPTIONS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'Go', 'Rust',
  'Java', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Vue.js', 'Angular',
  'Django', 'Flask', 'Express', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker',
  'Kubernetes', 'GraphQL', 'Next.js', 'Tailwind CSS', 'Redis', 'Elasticsearch'
];

export function DeveloperProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    skills: [] as string[],
    portfolio_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        bio: profile.bio || '',
        skills: profile.skills || [],
        portfolio_url: profile.portfolio_url || '',
      });
    }
  }, [profile]);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmedSkill],
      });
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio || null,
          skills: formData.skills.length > 0 ? formData.skills : null,
          portfolio_url: formData.portfolio_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      window.location.href = '/developer/dashboard';
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Developer Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name *"
              type="text"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

            <TextArea
              label="Bio"
              placeholder="Tell employers about yourself, your experience, and what you're looking for..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    if (e.target.value) {
                      addSkill(e.target.value);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a skill...</option>
                  {SKILLS_OPTIONS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="info" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Input
              label="Portfolio URL"
              type="url"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
            />

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => (window.location.href = '/developer/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Update Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
