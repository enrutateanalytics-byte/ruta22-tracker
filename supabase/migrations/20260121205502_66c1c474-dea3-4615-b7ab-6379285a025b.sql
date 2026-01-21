-- Drop existing policy that allows public access
DROP POLICY IF EXISTS "Service role can manage rate limit state" ON public.api_rate_limit_state;

-- Create a policy that denies all public access
-- Service role automatically bypasses RLS, so edge functions will still work
CREATE POLICY "Deny all public access"
ON public.api_rate_limit_state
FOR ALL
USING (false)
WITH CHECK (false);