-- Add deep analysis + input mode columns to projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS deep_analysis JSONB,
  ADD COLUMN IF NOT EXISTS input_mode    TEXT DEFAULT 'idea';

-- Index for faster deep_analysis lookups
CREATE INDEX IF NOT EXISTS idx_projects_deep_analysis_not_null
  ON public.projects ((deep_analysis IS NOT NULL))
  WHERE deep_analysis IS NOT NULL;
