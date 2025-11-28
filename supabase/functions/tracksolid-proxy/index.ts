import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Simple MD5 implementation for Deno
function md5(str: string): string {
  // Implementation using crypto API fallback
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  
  // MD5 block cipher implementation
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }
  
  function addUnsigned(x: number, y: number): number {
    const x4 = (x >> 16) & 0xFFFF;
    const x8 = x & 0xFFFF;
    const y4 = (y >> 16) & 0xFFFF;
    const y8 = y & 0xFFFF;
    const z8 = x8 + y8;
    const z4 = x4 + y4 + (z8 >> 16);
    return ((z4 << 16) | (z8 & 0xFFFF)) >>> 0;
  }
  
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(q, x), t));
    return addUnsigned(rotateLeft(a, s), b);
  }
  
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  
  // Convert string to blocks
  const blocks: number[] = [];
  for (let i = 0; i < data.length; i++) {
    blocks[i >> 2] |= data[i] << ((i % 4) * 8);
  }
  
  blocks[data.length >> 2] |= 0x80 << ((data.length % 4) * 8);
  blocks[(((data.length + 8) >> 6) << 4) + 14] = data.length * 8;
  
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  
  for (let i = 0; i < blocks.length; i += 16) {
    const oldA = a, oldB = b, oldC = c, oldD = d;
    
    a = ff(a, b, c, d, blocks[i], 7, -680876936);
    d = ff(d, a, b, c, blocks[i + 1], 12, -389564586);
    c = ff(c, d, a, b, blocks[i + 2], 17, 606105819);
    b = ff(b, c, d, a, blocks[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, blocks[i + 4], 7, -176418897);
    d = ff(d, a, b, c, blocks[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, blocks[i + 6], 17, -1473231341);
    b = ff(b, c, d, a, blocks[i + 7], 22, -45705983);
    a = ff(a, b, c, d, blocks[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, blocks[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, blocks[i + 10], 17, -42063);
    b = ff(b, c, d, a, blocks[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, blocks[i + 12], 7, 1804603682);
    d = ff(d, a, b, c, blocks[i + 13], 12, -40341101);
    c = ff(c, d, a, b, blocks[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, blocks[i + 15], 22, 1236535329);
    
    a = gg(a, b, c, d, blocks[i + 1], 5, -165796510);
    d = gg(d, a, b, c, blocks[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, blocks[i + 11], 14, 643717713);
    b = gg(b, c, d, a, blocks[i], 20, -373897302);
    a = gg(a, b, c, d, blocks[i + 5], 5, -701558691);
    d = gg(d, a, b, c, blocks[i + 10], 9, 38016083);
    c = gg(c, d, a, b, blocks[i + 15], 14, -660478335);
    b = gg(b, c, d, a, blocks[i + 4], 20, -405537848);
    a = gg(a, b, c, d, blocks[i + 9], 5, 568446438);
    d = gg(d, a, b, c, blocks[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, blocks[i + 3], 14, -187363961);
    b = gg(b, c, d, a, blocks[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, blocks[i + 13], 5, -1444681467);
    d = gg(d, a, b, c, blocks[i + 2], 9, -51403784);
    c = gg(c, d, a, b, blocks[i + 7], 14, 1735328473);
    b = gg(b, c, d, a, blocks[i + 12], 20, -1926607734);
    
    a = hh(a, b, c, d, blocks[i + 5], 4, -378558);
    d = hh(d, a, b, c, blocks[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, blocks[i + 11], 16, 1839030562);
    b = hh(b, c, d, a, blocks[i + 14], 23, -35309556);
    a = hh(a, b, c, d, blocks[i + 1], 4, -1530992060);
    d = hh(d, a, b, c, blocks[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, blocks[i + 7], 16, -155497632);
    b = hh(b, c, d, a, blocks[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, blocks[i + 13], 4, 681279174);
    d = hh(d, a, b, c, blocks[i], 11, -358537222);
    c = hh(c, d, a, b, blocks[i + 3], 16, -722521979);
    b = hh(b, c, d, a, blocks[i + 6], 23, 76029189);
    a = hh(a, b, c, d, blocks[i + 9], 4, -640364487);
    d = hh(d, a, b, c, blocks[i + 12], 11, -421815835);
    c = hh(c, d, a, b, blocks[i + 15], 16, 530742520);
    b = hh(b, c, d, a, blocks[i + 2], 23, -995338651);
    
    a = ii(a, b, c, d, blocks[i], 6, -198630844);
    d = ii(d, a, b, c, blocks[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, blocks[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, blocks[i + 5], 21, -57434055);
    a = ii(a, b, c, d, blocks[i + 12], 6, 1700485571);
    d = ii(d, a, b, c, blocks[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, blocks[i + 10], 15, -1051523);
    b = ii(b, c, d, a, blocks[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, blocks[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, blocks[i + 15], 10, -30611744);
    c = ii(c, d, a, b, blocks[i + 6], 15, -1560198380);
    b = ii(b, c, d, a, blocks[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, blocks[i + 4], 6, -145523070);
    d = ii(d, a, b, c, blocks[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, blocks[i + 2], 15, 718787259);
    b = ii(b, c, d, a, blocks[i + 9], 21, -343485551);
    
    a = addUnsigned(a, oldA);
    b = addUnsigned(b, oldB);
    c = addUnsigned(c, oldC);
    d = addUnsigned(d, oldD);
  }
  
  function wordToHex(word: number): string {
    let hex = "";
    for (let i = 0; i < 4; i++) {
      const byte = (word >>> (i * 8)) & 0xFF;
      hex += byte.toString(16).padStart(2, "0");
    }
    return hex;
  }
  
  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

const TRACKSOLID_API_URL = "https://hk-open.tracksolidpro.com/route/rest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Global token cache
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/**
 * Generate MD5 signature for TrackSolid API
 */
async function generateSign(params: Record<string, any>, appSecret: string): Promise<string> {
  // Sort params alphabetically
  const sortedKeys = Object.keys(params).filter(key => key !== 'sign').sort();
  
  // Build string: appSecret + key1value1key2value2... + appSecret
  let signStr = appSecret;
  for (const key of sortedKeys) {
    signStr += key + params[key];
  }
  signStr += appSecret;
  
  // Generate MD5 hash (uppercase)
  const hashHex = md5(signStr);
  return hashHex.toUpperCase();
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

  // Generate signature
  const sign = await generateSign(params, appSecret);
  
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

  const sign = await generateSign(params, appSecret);
  
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
