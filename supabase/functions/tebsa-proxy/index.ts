import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TEBSA_API_URL = "https://wstijuana45da56.nrtec-sys.com/tebsa/getUbicacion";
const TEBSA_API_KEY = "6eiWLiJI3l0vWOSKPq";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get unit ID from query parameters
    const url = new URL(req.url);
    const unitId = url.searchParams.get('id') || '0';

    console.log(`[TEBSA Proxy] Fetching data for unit ID: ${unitId}`);

    // Make request to TEBSA API
    const tebsaUrl = `${TEBSA_API_URL}?id=${unitId}&apikey=${TEBSA_API_KEY}`;
    const response = await fetch(tebsaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TEBSA API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[TEBSA Proxy] Response:`, data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[TEBSA Proxy] Error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        codigo: 4, 
        mensaje: `Proxy error: ${errorMessage}` 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
