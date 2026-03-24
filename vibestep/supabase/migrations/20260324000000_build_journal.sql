-- Build Journal table for per-project dev log entries
CREATE TABLE IF NOT EXISTS public.build_journal (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  mood       text        DEFAULT 'grinding',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.build_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journal"
  ON public.build_journal
  FOR ALL
  USING (auth.uid() = user_id);
