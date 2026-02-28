-- Supabase Auth Version
-- This schema works with Supabase's built-in authentication

-- Drop old tables if they exist (to fix uuid = integer error)
DROP TABLE IF EXISTS secrets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create secrets table using UUID for user_id (matches Supabase auth.users.id)
-- We don't need a separate users table - Supabase handles that!
CREATE TABLE IF NOT EXISTS secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own secrets
CREATE POLICY "Users can only see their own secrets"
  ON secrets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own secrets
CREATE POLICY "Users can insert their own secrets"
  ON secrets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own secrets
CREATE POLICY "Users can update their own secrets"
  ON secrets FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own secrets
CREATE POLICY "Users can delete their own secrets"
  ON secrets FOR DELETE
  USING (auth.uid() = user_id);
