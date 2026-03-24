-- ── Full-text search on projects ──────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(raw_idea, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS projects_search_idx
  ON public.projects USING gin(search_vector);

-- ── Notifications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  message     text        NOT NULL,
  type        text        NOT NULL DEFAULT 'info',  -- info | success | warning | risk
  read        boolean     NOT NULL DEFAULT false,
  link        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, read, created_at DESC)
  WHERE read = false;

-- ── Build step time tracking ───────────────────────────────────
ALTER TABLE public.build_steps
  ADD COLUMN IF NOT EXISTS time_spent_minutes INT NOT NULL DEFAULT 0;

-- ── Profile display name ───────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;
