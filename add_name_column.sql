-- Add name column to work_logs table
ALTER TABLE work_logs ADD COLUMN name TEXT;

-- Populate the name column from profiles table using person_id
UPDATE work_logs 
SET name = (
  SELECT COALESCE(profiles.full_name, profiles.email, 'Unknown User')
  FROM profiles 
  WHERE profiles.id = work_logs.person_id
)
WHERE person_id IS NOT NULL;

-- Set default value for any remaining null names or records without person_id
UPDATE work_logs SET name = 'Unknown User' WHERE name IS NULL;