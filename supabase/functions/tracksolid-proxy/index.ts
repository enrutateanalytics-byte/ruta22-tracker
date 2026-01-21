import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TRACKSOLID_API_URL = "https://us-open.tracksolidpro.com/route/rest";
const CACHE_DURATION_SECONDS = 10; // 10 seconds cache for real-time updates
const CACHE_DURATION_THROTTLED_SECONDS = 60; // 60 seconds when near daily limit
const DAILY_CALL_SOFT_LIMIT = 50000; // At 50k calls, increase cache duration

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Simple MD5 implementation for signing
 */
function md5(str: string): string {
  const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));
  
  const addUnsigned = (x: number, y: number) => {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  };
  
  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);
  
  const FF = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), addUnsigned(x, ac)), s), b);
  const GG = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, G(b, c, d)), addUnsigned(x, ac)), s), b);
  const HH = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, H(b, c, d)), addUnsigned(x, ac)), s), b);
  const II = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) =>
    addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, I(b, c, d)), addUnsigned(x, ac)), s), b);
  
  const convertToWordArray = (str: string) => {
    const len = str.length;
    const numWords = ((len + 8) >> 6) + 1;
    const words = new Array(numWords * 16).fill(0);
    for (let i = 0; i < len; i++) {
      words[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
    }
    words[len >> 2] |= 0x80 << ((len % 4) * 8);
    words[numWords * 16 - 2] = len * 8;
    return words;
  };
  
  const wordToHex = (value: number) => {
    let hex = "";
    for (let i = 0; i <= 3; i++) {
      hex += ((value >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return hex;
  };
  
  const x = convertToWordArray(str);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  
  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    
    a = FF(a, b, c, d, x[k], 7, 0xd76aa478); d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db); b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf); d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613); b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8); d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1); b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122); d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e); b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
    
    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562); d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51); b = GG(b, c, d, a, x[k], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d); d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681); b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6); d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87); b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905); d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9); b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    
    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942); d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122); b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44); d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60); b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6); d = HH(d, a, b, c, x[k], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085); b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039); d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8); b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    
    a = II(a, b, c, d, x[k], 6, 0xf4292244); d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7); b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3); d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d); b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f); d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314); b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82); d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb); b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
    
    a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }
  
  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

/**
 * Generate signature for TrackSolid API
 */
function generateSign(params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).filter(key => key !== 'sign').sort();
  
  let signStr = appSecret;
  for (const key of sortedKeys) {
    signStr += key + params[key];
  }
  signStr += appSecret;
  
  const signature = md5(signStr).toUpperCase();
  return signature;
}

/**
 * Get current timestamp in TrackSolid format (UTC)
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

interface RateLimitState {
  id: string;
  is_blocked: boolean;
  blocked_until: string | null;
  consecutive_failures: number;
  last_success_at: string | null;
  cached_token: string | null;
  token_expires_at: string | null;
  cached_locations: any[] | null;
  locations_expires_at: string | null;
  daily_call_count: number;
  daily_reset_at: string;
  updated_at: string;
}

/**
 * Get or create rate limit state from database
 */
async function getRateLimitState(supabase: any): Promise<RateLimitState> {
  const { data, error } = await supabase
    .from('api_rate_limit_state')
    .select('*')
    .eq('id', 'tracksolid')
    .single();
  
  if (error || !data) {
    // Create default state if not exists
    const defaultState: Partial<RateLimitState> = {
      id: 'tracksolid',
      is_blocked: false,
      blocked_until: null,
      consecutive_failures: 0,
      last_success_at: null,
      cached_token: null,
      token_expires_at: null,
      cached_locations: null,
      locations_expires_at: null,
      daily_call_count: 0,
      daily_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const { data: newData } = await supabase
      .from('api_rate_limit_state')
      .upsert(defaultState)
      .select()
      .single();
    
    return newData || defaultState as RateLimitState;
  }
  
  return data;
}

/**
 * Update rate limit state in database
 */
async function updateRateLimitState(supabase: any, updates: Partial<RateLimitState>): Promise<void> {
  await supabase
    .from('api_rate_limit_state')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', 'tracksolid');
}

/**
 * Check if we're rate limited
 */
function isRateLimited(state: RateLimitState): { blocked: boolean; waitMinutes: number } {
  if (!state.is_blocked || !state.blocked_until) {
    return { blocked: false, waitMinutes: 0 };
  }
  
  const blockedUntil = new Date(state.blocked_until).getTime();
  const now = Date.now();
  
  if (now < blockedUntil) {
    return { blocked: true, waitMinutes: Math.ceil((blockedUntil - now) / 60000) };
  }
  
  return { blocked: false, waitMinutes: 0 };
}

/**
 * Check if cached locations are still valid
 */
function isCacheValid(state: RateLimitState): boolean {
  if (!state.cached_locations || !state.locations_expires_at) {
    return false;
  }
  
  const expiresAt = new Date(state.locations_expires_at).getTime();
  return Date.now() < expiresAt;
}

/**
 * Check if cached token is still valid
 */
function isTokenValid(state: RateLimitState): boolean {
  if (!state.cached_token || !state.token_expires_at) {
    return false;
  }
  
  const expiresAt = new Date(state.token_expires_at).getTime();
  return Date.now() < expiresAt;
}

/**
 * Get access token from TrackSolid API (with persistent caching)
 */
async function getAccessToken(
  supabase: any,
  state: RateLimitState,
  account: string,
  passwordMd5: string,
  appKey: string,
  appSecret: string
): Promise<{ token: string; state: RateLimitState }> {
  // Check if we have a valid cached token
  if (isTokenValid(state)) {
    console.log("[TrackSolid Proxy] Using cached access token from DB");
    return { token: state.cached_token!, state };
  }

  // Check if we're rate limited
  const rateLimitCheck = isRateLimited(state);
  if (rateLimitCheck.blocked) {
    console.log(`[TrackSolid Proxy] Rate limited on auth, wait ${rateLimitCheck.waitMinutes} min`);
    throw new Error(`Rate limited. Try again in ${rateLimitCheck.waitMinutes} minutes.`);
  }

  console.log(`[TrackSolid Proxy] Fetching new access token for account: ${account}, pwd_md5_prefix: ${passwordMd5.substring(0, 8)}..., app_key_prefix: ${appKey.substring(0, 8)}...`);
  
  const params = {
    method: "jimi.oauth.token.get",
    timestamp: getTimestamp(),
    app_key: appKey,
    sign_method: "md5",
    v: "1.0",
    format: "json",
    user_id: account,
    user_pwd_md5: passwordMd5,
    expires_in: "7200",
  };

  const sign = generateSign(params, appSecret);
  
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("sign", sign);

  const response = await fetch(TRACKSOLID_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`TrackSolid auth failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[TrackSolid Proxy] Auth response: code=${data.code}, message=${data.message || 'none'}`);
  
  if (data.code !== 0) {
    // Check for rate limiting error
    if (data.message && (data.message.includes('频率过高') || data.message.includes('请求频率') || data.message.toLowerCase().includes('rate') || data.message.toLowerCase().includes('frequency'))) {
      // Exponential backoff: 5 min -> 10 min -> 20 min -> 30 min (max)
      const failures = state.consecutive_failures + 1;
      const backoffMinutes = Math.min(5 * Math.pow(2, failures - 1), 30);
      
      console.log(`[TrackSolid Proxy] Auth rate limited! Attempt ${failures}, blocking for ${backoffMinutes} minutes`);
      
      await updateRateLimitState(supabase, {
        is_blocked: true,
        blocked_until: new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString(),
        consecutive_failures: failures,
      });
      
      throw new Error(`Rate limited. Try again in ${backoffMinutes} minutes.`);
    }
    
    throw new Error(`TrackSolid auth error: ${data.message}`);
  }

  const accessToken = data.result.accessToken;
  const expiresIn = parseInt(data.result.expiresIn) || 7200;
  
  // Cache token in database (expire 5 min before actual expiry)
  const tokenExpiresAt = new Date(Date.now() + (expiresIn - 300) * 1000).toISOString();
  
  await updateRateLimitState(supabase, {
    cached_token: accessToken,
    token_expires_at: tokenExpiresAt,
    is_blocked: false,
    blocked_until: null,
    consecutive_failures: 0,
    last_success_at: new Date().toISOString(),
  });

  console.log("[TrackSolid Proxy] Access token obtained and cached in DB");
  
  // Return updated state
  const newState = { ...state, cached_token: accessToken, token_expires_at: tokenExpiresAt };
  return { token: accessToken, state: newState };
}

/**
 * Get locations for devices using jimi.device.location.get method
 * This method accepts IMEIs directly (up to 100 per request)
 * Limit: 8,640 calls/day (~6 calls/minute for 24h)
 */
async function getDevicesLocationByImei(
  supabase: any,
  state: RateLimitState,
  imeis: string,
  accessToken: string,
  appKey: string,
  appSecret: string
): Promise<any[]> {
  // Reset daily counter if past reset time
  const dailyResetAt = new Date(state.daily_reset_at).getTime();
  if (Date.now() > dailyResetAt) {
    console.log("[TrackSolid Proxy] Resetting daily call counter");
    await updateRateLimitState(supabase, {
      daily_call_count: 0,
      daily_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    state.daily_call_count = 0;
  }

  // Check if we're rate limited
  const rateLimitCheck = isRateLimited(state);
  if (rateLimitCheck.blocked) {
    console.log(`[TrackSolid Proxy] Rate limited, returning cached data. Wait ${rateLimitCheck.waitMinutes} min`);
    return state.cached_locations || [];
  }

  // Check cache first
  if (isCacheValid(state)) {
    console.log("[TrackSolid Proxy] Using cached locations from DB");
    return state.cached_locations || [];
  }

  const imeiCount = imeis.split(',').length;
  console.log(`[TrackSolid Proxy] Fetching locations for ${imeiCount} devices by IMEI`);
  
  // jimi.device.location.get - uses imeis parameter directly
  // Limit: 8,640 calls/day, max 100 IMEIs per call
  const params = {
    method: "jimi.device.location.get",
    timestamp: getTimestamp(),
    app_key: appKey,
    sign_method: "md5",
    v: "1.0",
    format: "json",
    access_token: accessToken,
    imeis: imeis, // Comma-separated list of IMEIs
  };

  const sign = generateSign(params, appSecret);
  
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("sign", sign);

  const response = await fetch(TRACKSOLID_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  // Always read the response body to understand the error
  const data = await response.json();
  console.log("[TrackSolid Proxy] Batch API response - status:", response.status, "code:", data.code, "message:", data.message);
  
  // Handle HTTP errors or API errors
  if (!response.ok || data.code !== 0) {
    if (data.code === 1004) {
      // Token expired, clear it
      console.log("[TrackSolid Proxy] Token expired (code 1004), clearing cache");
      await updateRateLimitState(supabase, { cached_token: null, token_expires_at: null });
    }
    
    // Check for rate limiting error (various possible messages)
    const errorMsg = data.message || '';
    const isRateLimitError = errorMsg.includes('频率过高') || 
                              errorMsg.includes('请求频率') || 
                              errorMsg.toLowerCase().includes('rate') || 
                              errorMsg.toLowerCase().includes('frequency') ||
                              errorMsg.toLowerCase().includes('too many') ||
                              data.code === 1003; // Common rate limit code
    
    if (isRateLimitError) {
      const failures = state.consecutive_failures + 1;
      const backoffMinutes = Math.min(5 * Math.pow(2, failures - 1), 30);
      
      console.log(`[TrackSolid Proxy] Rate limited! Attempt ${failures}, blocking for ${backoffMinutes} minutes`);
      
      await updateRateLimitState(supabase, {
        is_blocked: true,
        blocked_until: new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString(),
        consecutive_failures: failures,
      });
      
      // Return cached data if available
      return state.cached_locations || [];
    }
    
    // Return cached data on any error, don't throw
    console.log("[TrackSolid Proxy] API error, returning cached data if available");
    if (state.cached_locations && state.cached_locations.length > 0) {
      return state.cached_locations;
    }
    
    throw new Error(`TrackSolid batch error: ${data.code} - ${data.message}`);
  }

  // Success - update state
  const locations = data.result || [];
  console.log(`[TrackSolid Proxy] Fetched ${locations.length} devices. Raw result:`, JSON.stringify(data.result).substring(0, 500));
  const newDailyCount = state.daily_call_count + 1;
  
  // Determine cache duration based on daily usage
  const cacheDurationSeconds = newDailyCount > DAILY_CALL_SOFT_LIMIT 
    ? CACHE_DURATION_THROTTLED_SECONDS 
    : CACHE_DURATION_SECONDS;
  
  const locationsExpiresAt = new Date(Date.now() + cacheDurationSeconds * 1000).toISOString();
  
  await updateRateLimitState(supabase, {
    cached_locations: locations,
    locations_expires_at: locationsExpiresAt,
    is_blocked: false,
    blocked_until: null,
    consecutive_failures: 0,
    last_success_at: new Date().toISOString(),
    daily_call_count: newDailyCount,
  });

  console.log(`[TrackSolid Proxy] Fetched ${locations.length} devices. Daily calls: ${newDailyCount}/${DAILY_CALL_SOFT_LIMIT}`);
  return locations;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for DB access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const account = Deno.env.get("TRACKSOLID_ACCOUNT");
    const passwordMd5 = Deno.env.get("TRACKSOLID_PASSWORD_MD5");
    const appKey = Deno.env.get("TRACKSOLID_APP_KEY");
    const appSecret = Deno.env.get("TRACKSOLID_APP_SECRET");

    if (!account || !passwordMd5 || !appKey || !appSecret) {
      throw new Error("TrackSolid credentials not configured");
    }

    const url = new URL(req.url);
    const mode = url.searchParams.get("mode");
    const imeis = url.searchParams.get("imeis");

    // RESET MODE: Clear token and rate limit state
    if (mode === "reset") {
      console.log("[TrackSolid Proxy] Resetting connection state");
      await updateRateLimitState(supabase, {
        cached_token: null,
        token_expires_at: null,
        is_blocked: false,
        blocked_until: null,
        consecutive_failures: 0,
      });
      return new Response(
        JSON.stringify({ success: true, message: "Connection reset successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current rate limit state from database
    let state = await getRateLimitState(supabase);

    // BATCH MODE: Get all devices in one call
    if (mode === "batch" && imeis) {
      console.log(`[TrackSolid Proxy] Batch mode for ${imeis.split(',').length} devices`);
      
      // Check if we have valid cached data (no need to get token)
      if (isCacheValid(state)) {
        console.log("[TrackSolid Proxy] Returning cached locations from DB");
        const results = (state.cached_locations || []).map((loc: any) => {
          const isAvailable = loc.status !== "0" && loc.lat && loc.lng;
          return {
            imei: loc.imei,
            codigo: isAvailable ? 1 : 0,
            mensaje: isAvailable ? "Disponible" : "No disponible",
            latitud: isAvailable ? loc.lat : 0,
            longitud: isAvailable ? loc.lng : 0,
            velocidad: parseFloat(loc.speed) || 0,
            orientacion: parseFloat(loc.direction) || 0,
          };
        });
        
        return new Response(
          JSON.stringify({ success: true, count: results.length, units: results, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if rate limited
      const rateLimitCheck = isRateLimited(state);
      if (rateLimitCheck.blocked && state.cached_locations) {
        console.log(`[TrackSolid Proxy] Rate limited, returning stale cache. Wait ${rateLimitCheck.waitMinutes} min`);
        const results = state.cached_locations.map((loc: any) => {
          const isAvailable = loc.status !== "0" && loc.lat && loc.lng;
          return {
            imei: loc.imei,
            codigo: isAvailable ? 1 : 0,
            mensaje: isAvailable ? "Disponible" : "No disponible",
            latitud: isAvailable ? loc.lat : 0,
            longitud: isAvailable ? loc.lng : 0,
            velocidad: parseFloat(loc.speed) || 0,
            orientacion: parseFloat(loc.direction) || 0,
          };
        });
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            count: results.length, 
            units: results, 
            cached: true, 
            rate_limited: true,
            retry_in_minutes: rateLimitCheck.waitMinutes 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get token and locations
      const tokenResult = await getAccessToken(supabase, state, account, passwordMd5, appKey, appSecret);
      state = tokenResult.state;
      
      const locations = await getDevicesLocationByImei(supabase, state, imeis, tokenResult.token, appKey, appSecret);

      const results = locations.map((loc: any) => {
        const isAvailable = loc.status !== "0" && loc.lat && loc.lng;
        return {
          imei: loc.imei,
          codigo: isAvailable ? 1 : 0,
          mensaje: isAvailable ? "Disponible" : "No disponible",
          latitud: isAvailable ? loc.lat : 0,
          longitud: isAvailable ? loc.lng : 0,
          velocidad: parseFloat(loc.speed) || 0,
          orientacion: parseFloat(loc.direction) || 0,
        };
      });

      return new Response(
        JSON.stringify({ success: true, count: results.length, units: results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LEGACY: Single IMEI mode
    const imei = url.searchParams.get("imei");
    if (!imei) {
      return new Response(
        JSON.stringify({ codigo: -1, mensaje: "IMEI or batch mode required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenResult = await getAccessToken(supabase, state, account, passwordMd5, appKey, appSecret);
    state = tokenResult.state;
    
    const locations = await getDevicesLocationByImei(supabase, state, imei, tokenResult.token, appKey, appSecret);
    const loc = locations.find((l: any) => l.imei === imei);
    
    if (loc && loc.status !== "0" && loc.lat && loc.lng) {
      return new Response(
        JSON.stringify({
          codigo: 1,
          mensaje: "Disponible",
          latitud: loc.lat,
          longitud: loc.lng,
          velocidad: parseFloat(loc.speed) || 0,
          orientacion: parseFloat(loc.direction) || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ codigo: 0, mensaje: "No disponible", latitud: 0, longitud: 0, velocidad: 0, orientacion: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[TrackSolid Proxy] Error:", error);

    return new Response(
      JSON.stringify({
        codigo: -1,
        mensaje: error instanceof Error ? error.message : "Error",
        latitud: 0,
        longitud: 0,
        velocidad: 0,
        orientacion: 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
