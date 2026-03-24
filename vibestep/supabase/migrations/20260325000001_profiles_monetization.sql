-- Add monetization + referral columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS analyses_used       INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS analyses_reset_date DATE    DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS plan                TEXT    DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS referral_code       TEXT    UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by         TEXT,
  ADD COLUMN IF NOT EXISTS bonus_analyses      INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_weekly_digest BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_risk_alerts   BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_build_tips    BOOLEAN DEFAULT true;

-- Auto-generate referral codes for all existing users
UPDATE public.profiles
SET referral_code = SUBSTRING(id::text, 1, 8)
WHERE referral_code IS NULL;

-- Function: auto-set referral_code on new profile creation
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON public.profiles;
CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- Upgrade waitlist table
CREATE TABLE IF NOT EXISTS public.upgrade_waitlist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  plan       text        DEFAULT 'pro',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.upgrade_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON public.upgrade_waitlist FOR INSERT WITH CHECK (true);
