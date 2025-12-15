import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Md5 } from "https://deno.land/std@0.160.0/hash/md5.ts";

const TRACKSOLID_API_URL = "https://hk-open.tracksolidpro.com/route/rest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Global token cache - cache for 1 hour (3600 seconds)
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

// Location cache to reduce API calls - cache for 45 seconds
const locationCache = new Map<string, { data: any; expiresAt: number }>();

/**
 * Generate MD5 signature for TrackSolid API
 */
function generateSign(params: Record<string, any>, appSecret: string): string {
  // Sort params alphabetically
  const sortedKeys = Object.keys(params).filter(key => key !== 'sign').sort();
  
  // Build string: appSecret + key1value1key2value2... + appSecret
  let signStr = appSecret;
  for (const key of sortedKeys) {
    signStr += key + params[key];
  }
  signStr += appSecret;
  
  console.log("[TrackSolid Proxy] Sign string:", signStr);
  
  // Generate MD5 hash (uppercase) using Deno's Md5 class
  const md5 = new Md5();
  md5.update(signStr);
  const signature = md5.toString().toUpperCase();
  
  console.log("[TrackSolid Proxy] Generated signature:", signature);
  
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

/**
 * Get access token from TrackSolid API (with caching)
 */
async function getAccessToken(
  account: string,
  passwordMd5: string,
  appKey: string,
  appSecret: string
): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log("[TrackSolid Proxy] Using cached access token");
    return cachedToken.accessToken;
  }

  console.log("[TrackSolid Proxy] Fetching new access token");
  console.log("[TrackSolid Proxy] Account:", account);
  console.log("[TrackSolid Proxy] App Key:", appKey);
  
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

  console.log("[TrackSolid Proxy] Auth params:", JSON.stringify(params, null, 2));

  // Generate signature
  const sign = generateSign(params, appSecret);
  
  // Build form data
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("sign", sign);

  const response = await fetch(TRACKSOLID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`TrackSolid auth failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`TrackSolid auth error: ${data.message}`);
  }

  const accessToken = data.result.accessToken;
  const expiresIn = parseInt(data.result.expiresIn) || 7200;
  
  // Cache token (expire 5 minutes early to be safe)
  cachedToken = {
    accessToken,
    expiresAt: Date.now() + (expiresIn - 300) * 1000,
  };

  console.log("[TrackSolid Proxy] New access token obtained, expires in:", expiresIn);
  
  return accessToken;
}

/**
 * Get location for specific IMEI(s)
 */
async function getDeviceLocation(
  imei: string,
  accessToken: string,
  appKey: string,
  appSecret: string
): Promise<any> {
  // Check location cache first
  const cacheKey = `location_${imei}`;
  const cached = locationCache.get(cacheKey);
  
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`[TrackSolid Proxy] Using cached location for IMEI: ${imei}`);
    return cached.data;
  }

  console.log(`[TrackSolid Proxy] Fetching fresh location for IMEI: ${imei}`);
  
  const params = {
    method: "jimi.device.location.get",
    timestamp: getTimestamp(),
    app_key: appKey,
    sign_method: "md5",
    v: "1.0",
    format: "json",
    access_token: accessToken,
    imeis: imei,
  };

  const sign = generateSign(params, appSecret);
  
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("sign", sign);

  const response = await fetch(TRACKSOLID_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`TrackSolid location request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.code !== 0) {
    // Token might have expired, clear cache
    if (data.code === 1004) {
      cachedToken = null;
    }
    throw new Error(`TrackSolid location error: ${data.message}`);
  }

  // Cache the location result for 45 seconds
  locationCache.set(cacheKey, {
    data: data.result,
    expiresAt: Date.now() + 45000 // 45 seconds
  });

  return data.result;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const account = Deno.env.get("TRACKSOLID_ACCOUNT");
    const passwordMd5 = Deno.env.get("TRACKSOLID_PASSWORD_MD5");
    const appKey = Deno.env.get("TRACKSOLID_APP_KEY");
    const appSecret = Deno.env.get("TRACKSOLID_APP_SECRET");

    if (!account || !passwordMd5 || !appKey || !appSecret) {
      throw new Error("TrackSolid credentials not configured");
    }

    // Get IMEI from query params
    const url = new URL(req.url);
    const imei = url.searchParams.get("imei");

    if (!imei) {
      return new Response(
        JSON.stringify({ 
          codigo: -1,
          mensaje: "IMEI parameter is required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[TrackSolid Proxy] Fetching location for IMEI: ${imei}`);

    // Get access token (cached if available)
    const accessToken = await getAccessToken(account, passwordMd5, appKey, appSecret);

    // Get device location
    const locations = await getDeviceLocation(imei, accessToken, appKey, appSecret);

    // Transform response to match TEBSA format for compatibility
    if (locations && locations.length > 0) {
      const location = locations[0];
      
      // Check if device is online and has valid coordinates
      if (location.status === "0" || !location.lat || !location.lng) {
        return new Response(
          JSON.stringify({
            codigo: 0,
            mensaje: "No disponible",
            latitud: 0,
            longitud: 0,
            velocidad: 0,
            orientacion: 0,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          codigo: 1,
          mensaje: "Disponible",
          latitud: location.lat,
          longitud: location.lng,
          velocidad: parseFloat(location.speed) || 0,
          orientacion: 0, // TrackSolid doesn't provide orientation directly
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // No location data
    return new Response(
      JSON.stringify({
        codigo: 0,
        mensaje: "No disponible",
        latitud: 0,
        longitud: 0,
        velocidad: 0,
        orientacion: 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[TrackSolid Proxy] Error:", error);
    return new Response(
      JSON.stringify({
        codigo: -1,
        mensaje: error instanceof Error ? error.message : "Error desconocido",
        latitud: 0,
        longitud: 0,
        velocidad: 0,
        orientacion: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
