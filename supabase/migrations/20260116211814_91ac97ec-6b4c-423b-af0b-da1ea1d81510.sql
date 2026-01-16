-- Create table to persist rate limit state across edge function calls
CREATE TABLE public.api_rate_limit_state (
  id TEXT PRIMARY KEY DEFAULT 'tracksolid',
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_until TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  cached_token TEXT,
  token_expires_at TIMESTAMPTZ,
  cached_locations JSONB,
  locations_expires_at TIMESTAMPTZ,
  daily_call_count INTEGER NOT NULL DEFAULT 0,
  daily_reset_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default row for TrackSolid
INSERT INTO public.api_rate_limit_state (id, daily_reset_at) 
VALUES ('tracksolid', now() + interval '24 hours');

-- Enable RLS
ALTER TABLE public.api_rate_limit_state ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role can manage rate limit state"
ON public.api_rate_limit_state
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for quick lookups
CREATE INDEX idx_api_rate_limit_state_blocked ON public.api_rate_limit_state(is_blocked, blocked_until);