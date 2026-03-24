-- Newsletter subscribers table (public, no auth required)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- No RLS needed — inserts are anonymous (public signup)
-- But restrict reads to service role only
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (false);

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);
