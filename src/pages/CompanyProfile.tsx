import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import type { Company } from '../types/database';

export function CompanyProfile() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    fetchCompany();
  }, [user]);

  const fetchCompany = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompany(data);
        setFormData({
          company_name: data.company_name,
          logo_url: data.logo_url || '',
          website: data.website || '',
          description: data.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {
      if (company) {
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', company.id);

        if (error) throw error;
        alert('Company profile updated successfully!');
      } else {
        const { error } = await supabase.from('companies').insert({
          user_id: user.id,
          ...formData,
        });

        if (error) throw error;
        alert('Company profile created successfully!');
      }

      fetchCompany();
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Company Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Company Name *"
              type="text"
              placeholder="Acme Inc."
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              required
            />

            <Input
              label="Logo URL"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            />

            <Input
              label="Website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />

            <TextArea
              label="Company Description"
              placeholder="Tell developers about your company, culture, and what makes it a great place to work..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
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
                {company ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
