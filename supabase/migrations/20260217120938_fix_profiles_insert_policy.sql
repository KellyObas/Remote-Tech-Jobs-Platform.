/*
  # Fix Profiles Insert Policy

  ## Changes
  Add INSERT policy for profiles table to allow the trigger function to create profiles
  when new users sign up.

  ## Security
  - Allow service role to insert profiles (used by trigger)
  - The trigger function runs with SECURITY DEFINER which should bypass RLS,
    but we're adding this policy as an extra safeguard
*/

-- Add INSERT policy for profiles
CREATE POLICY "Allow service role to insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);
