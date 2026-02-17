export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'employer' | 'developer';
          bio: string | null;
          skills: string[] | null;
          portfolio_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'employer' | 'developer';
          bio?: string | null;
          skills?: string[] | null;
          portfolio_url?: string | null;
        };
        Update: {
          full_name?: string;
          bio?: string | null;
          skills?: string[] | null;
          portfolio_url?: string | null;
        };
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          logo_url: string | null;
          website: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          company_name: string;
          logo_url?: string | null;
          website?: string | null;
          description?: string | null;
        };
        Update: {
          company_name?: string;
          logo_url?: string | null;
          website?: string | null;
          description?: string | null;
        };
      };
      jobs: {
        Row: {
          id: string;
          employer_id: string;
          company_id: string;
          title: string;
          description: string;
          tech_stack: string[];
          experience_level: 'Junior' | 'Mid' | 'Senior';
          salary_range: string;
          employment_type: 'Full-time' | 'Contract' | 'Internship';
          timezone: string | null;
          status: 'Open' | 'Closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          employer_id: string;
          company_id: string;
          title: string;
          description: string;
          tech_stack: string[];
          experience_level: 'Junior' | 'Mid' | 'Senior';
          salary_range: string;
          employment_type: 'Full-time' | 'Contract' | 'Internship';
          timezone?: string | null;
          status?: 'Open' | 'Closed';
        };
        Update: {
          title?: string;
          description?: string;
          tech_stack?: string[];
          experience_level?: 'Junior' | 'Mid' | 'Senior';
          salary_range?: string;
          employment_type?: 'Full-time' | 'Contract' | 'Internship';
          timezone?: string | null;
          status?: 'Open' | 'Closed';
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          developer_id: string;
          resume_url: string;
          cover_letter: string | null;
          status: 'Pending' | 'Accepted' | 'Rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          job_id: string;
          developer_id: string;
          resume_url: string;
          cover_letter?: string | null;
          status?: 'Pending' | 'Accepted' | 'Rejected';
        };
        Update: {
          resume_url?: string;
          cover_letter?: string | null;
          status?: 'Pending' | 'Accepted' | 'Rejected';
        };
      };
      bookmarks: {
        Row: {
          id: string;
          job_id: string;
          developer_id: string;
          created_at: string;
        };
        Insert: {
          job_id: string;
          developer_id: string;
        };
        Update: {};
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];

export type JobWithCompany = Job & {
  companies: Company;
};

export type ApplicationWithDetails = Application & {
  jobs: JobWithCompany;
  profiles: Profile;
};
