import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TRACKSOLID_API_URL = "https://hk-open.tracksolidpro.com/route/rest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Global token cache
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

// Location cache to reduce API calls - cache for 45 seconds
const locationCache = new Map<string, { data: any; expiresAt: number }>();

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
  
  console.log("[TrackSolid Proxy] Sign string:", signStr);
  
  const signature = md5(signStr).toUpperCase();
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
 * Get access token from TrackSolid API
 */
async function getAccessToken(
  account: string,
  passwordMd5: string,
  appKey: string,
  appSecret: string
): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log("[TrackSolid Proxy] Using cached access token");
    return cachedToken.accessToken;
  }

  console.log("[TrackSolid Proxy] Fetching new access token");
  
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
  
  if (data.code !== 0) {
    throw new Error(`TrackSolid auth error: ${data.message}`);
  }

  const accessToken = data.result.accessToken;
  const expiresIn = parseInt(data.result.expiresIn) || 7200;
  
  cachedToken = {
    accessToken,
    expiresAt: Date.now() + (expiresIn - 300) * 1000,
  };

  console.log("[TrackSolid Proxy] Access token obtained");
  return accessToken;
}

/**
 * Get location for specific IMEI
 */
async function getDeviceLocation(
  imei: string,
  accessToken: string,
  appKey: string,
  appSecret: string
): Promise<any> {
  const cacheKey = `location_${imei}`;
  const cached = locationCache.get(cacheKey);
  
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`[TrackSolid Proxy] Using cached location for IMEI: ${imei}`);
    return cached.data;
  }

  console.log(`[TrackSolid Proxy] Fetching location for IMEI: ${imei}`);
  
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
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`TrackSolid location failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.code !== 0) {
    if (data.code === 1004) cachedToken = null;
    throw new Error(`TrackSolid error: ${data.message}`);
  }

  locationCache.set(cacheKey, {
    data: data.result,
    expiresAt: Date.now() + 45000
  });

  return data.result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const account = Deno.env.get("TRACKSOLID_ACCOUNT");
    const passwordMd5 = Deno.env.get("TRACKSOLID_PASSWORD_MD5");
    const appKey = Deno.env.get("TRACKSOLID_APP_KEY");
    const appSecret = Deno.env.get("TRACKSOLID_APP_SECRET");

    if (!account || !passwordMd5 || !appKey || !appSecret) {
      throw new Error("TrackSolid credentials not configured");
    }

    const url = new URL(req.url);
    const imei = url.searchParams.get("imei");

    if (!imei) {
      return new Response(
        JSON.stringify({ codigo: -1, mensaje: "IMEI required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getAccessToken(account, passwordMd5, appKey, appSecret);
    const locations = await getDeviceLocation(imei, accessToken, appKey, appSecret);

    if (locations && locations.length > 0) {
      const loc = locations[0];
      
      if (loc.status === "0" || !loc.lat || !loc.lng) {
        return new Response(
          JSON.stringify({ codigo: 0, mensaje: "No disponible", latitud: 0, longitud: 0, velocidad: 0, orientacion: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          codigo: 1,
          mensaje: "Disponible",
          latitud: loc.lat,
          longitud: loc.lng,
          velocidad: parseFloat(loc.speed) || 0,
          orientacion: 0,
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

    // IMPORTANT:
    // TrackSolid may temporarily block requests with "请求频率过高" (request frequency too high).
    // Returning HTTP 200 prevents the client from treating it as a transport failure and crashing UI.
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
