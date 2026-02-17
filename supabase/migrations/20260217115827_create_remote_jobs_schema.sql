/*
  # Remote Tech Jobs Platform Schema

  ## Overview
  This migration creates the complete database schema for a remote tech jobs platform
  with role-based access control for employers and developers.

  ## New Tables
  
  ### 1. profiles
  Extends auth.users with additional user information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `role` (text) - 'employer' or 'developer'
  - `bio` (text, nullable)
  - `skills` (text array, nullable) - for developers
  - `portfolio_url` (text, nullable) - for developers
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. companies
  Company profiles for employers
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles.id)
  - `company_name` (text)
  - `logo_url` (text, nullable)
  - `website` (text, nullable)
  - `description` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. jobs
  Job postings created by employers
  - `id` (uuid, primary key)
  - `employer_id` (uuid, references profiles.id)
  - `company_id` (uuid, references companies.id)
  - `title` (text)
  - `description` (text)
  - `tech_stack` (text array)
  - `experience_level` (text) - 'Junior', 'Mid', 'Senior'
  - `salary_range` (text)
  - `employment_type` (text) - 'Full-time', 'Contract', 'Internship'
  - `timezone` (text, nullable)
  - `status` (text) - 'Open' or 'Closed'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. applications
  Job applications submitted by developers
  - `id` (uuid, primary key)
  - `job_id` (uuid, references jobs.id)
  - `developer_id` (uuid, references profiles.id)
  - `resume_url` (text)
  - `cover_letter` (text, nullable)
  - `status` (text) - 'Pending', 'Accepted', 'Rejected'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. bookmarks
  Jobs bookmarked by developers
  - `id` (uuid, primary key)
  - `job_id` (uuid, references jobs.id)
  - `developer_id` (uuid, references profiles.id)
  - `created_at` (timestamptz)

  ## Security
  
  ### profiles table:
  - Enable RLS
  - Users can read all profiles
  - Users can update only their own profile
  - Profiles are created via trigger on auth.users insert

  ### companies table:
  - Enable RLS
  - Everyone can read companies
  - Only employer owners can insert/update their company
  - Only employer owners can delete their company

  ### jobs table:
  - Enable RLS
  - Everyone can read open jobs
  - Only employers can create jobs
  - Only job owners can update/delete their jobs

  ### applications table:
  - Enable RLS
  - Developers can read their own applications
  - Employers can read applications for their jobs
  - Only developers can create applications
  - Only developers can update their own applications
  - Only employers can update application status for their jobs

  ### bookmarks table:
  - Enable RLS
  - Users can only read/create/delete their own bookmarks

  ## Notes
  - All timestamps use `timestamptz` for proper timezone handling
  - Arrays are used for tech_stack and skills for flexible storage
  - Cascade deletes ensure data integrity
  - Indexes are added for frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('employer', 'developer')),
  bio text,
  skills text[],
  portfolio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  logo_url text,
  website text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  tech_stack text[] NOT NULL DEFAULT '{}',
  experience_level text NOT NULL CHECK (experience_level IN ('Junior', 'Mid', 'Senior')),
  salary_range text NOT NULL,
  employment_type text NOT NULL CHECK (employment_type IN ('Full-time', 'Contract', 'Internship')),
  timezone text,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  developer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resume_url text NOT NULL,
  cover_letter text,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, developer_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  developer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, developer_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_developer_id ON applications(developer_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_developer_id ON bookmarks(developer_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'developer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can create their company"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'employer'
    )
  );

CREATE POLICY "Employers can update their own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can delete their own company"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'employer'
    )
  );

CREATE POLICY "Employers can update their own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = employer_id);

-- Applications policies
CREATE POLICY "Developers can view their own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = developer_id OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Developers can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = developer_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'developer'
    )
  );

CREATE POLICY "Developers can update their own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = developer_id)
  WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Employers can update application status for their jobs"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = developer_id);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = developer_id);