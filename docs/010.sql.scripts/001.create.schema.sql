-- Step 1: Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS ai_agent;

-- Step 2: Grant privileges to the default Supabase authenticated role
GRANT USAGE ON SCHEMA ai_agent TO authenticated;
GRANT CREATE ON SCHEMA ai_agent TO authenticated;

-- (Optional) Set ai_agent as the default schema for future sessions (for a given role)
ALTER ROLE authenticated SET search_path TO ai_agent, public;

-- DROP SCHEMA IF EXISTS ai_agent CASCADE;