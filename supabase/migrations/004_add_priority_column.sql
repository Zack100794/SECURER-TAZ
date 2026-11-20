-- Add priority column to step2_requirements table
ALTER TABLE step2_requirements ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
