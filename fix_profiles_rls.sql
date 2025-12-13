-- Fix profiles RLS policy to allow viewing all team members

-- First, check existing policies (run this to see what exists)
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Drop existing policy if it exists (uncomment if needed)
-- DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Create new policy to allow all authenticated users to view all profiles
CREATE POLICY "Allow authenticated users to view all profiles" 
ON profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Alternative: If you want to allow viewing all profiles without restriction
-- CREATE POLICY "Allow viewing all profiles" 
-- ON profiles FOR SELECT 
-- USING (true);