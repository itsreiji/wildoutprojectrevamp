-- Migration: Add social_links column to team_members
-- Description: Adds a JSONB column to store social media links for team members
-- Created: 2025-12-08

-- Add social_links column as JSONB with default empty object
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- Update existing rows to have an empty object if null
UPDATE public.team_members 
SET social_links = '{}'::jsonb 
WHERE social_links IS NULL;

-- Comment on the column for documentation
COMMENT ON COLUMN public.team_members.social_links IS 'JSONB object containing social media links (e.g., { "twitter": "https://...", "linkedin": "https://..." })';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_member_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to update the updated_at column on update
CREATE OR REPLACE TRIGGER update_team_member_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION update_team_member_updated_at();
