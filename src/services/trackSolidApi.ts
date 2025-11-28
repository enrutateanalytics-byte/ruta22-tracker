import { supabase } from "@/integrations/supabase/client";

export interface TrackSolidUnit {
  id: number;
  lat: number;
  lng: number;
  speed: number;
  orientation: number;
  available: boolean;
}

export interface TrackSolidApiResponse {
  codigo: number;
  mensaje: string;
  latitud: number;
  longitud: number;
  velocidad: number;
  orientacion: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const trackSolidApi = {
  /**
   * Fetch location data for a specific unit by IMEI
   */
  async getUnitLocation(imei: number, retryCount = 0): Promise<TrackSolidUnit[]> {
    try {
      console.log(`[TrackSolid API] Fetching location for IMEI: ${imei}`);

      const url = `https://pfbkwcuuqowllpnxokxh.supabase.co/functions/v1/tracksolid-proxy?imei=${imei}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYmt3Y3V1cW93bGxwbnhva3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTU4NDcsImV4cCI6MjA3NDUzMTg0N30.SAL7nBlINRqBvn6wc5V8WT81ID_Y4PIPMHdbZaJJgPQ'
        }
      });

      if (!response.ok) {
        throw new Error(`Edge Function returned a non-2xx status code`);
      }

      const data = await response.json() as TrackSolidApiResponse;

      // Transform response to unit format
      if (data.codigo === 1 && data.mensaje === "Disponible") {
        return [{
          id: imei,
          lat: data.latitud,
          lng: data.longitud,
          speed: data.velocidad,
          orientation: data.orientacion,
          available: true,
        }];
      }

      console.log(`[TrackSolid API] Unit ${imei} not available: ${data.mensaje}`);
      return [];

    } catch (error) {
      console.error(`[TrackSolid API] Error fetching unit ${imei}:`, error);

      // Retry logic for network errors
      if (retryCount < MAX_RETRIES) {
        console.log(`[TrackSolid API] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return this.getUnitLocation(imei, retryCount + 1);
      }

      return [];
    }
  },

  /**
   * Fetch location data for multiple units concurrently
   */
  async getMultipleUnitsLocation(imeis: number[]): Promise<TrackSolidUnit[]> {
    console.log(`[TrackSolid API] Fetching locations for ${imeis.length} units`);

    // Add staggered delays to avoid rate limiting (100ms between each request)
    const promises = imeis.map((imei, index) => 
      new Promise<TrackSolidUnit[]>(resolve => 
        setTimeout(
          () => this.getUnitLocation(imei).then(resolve),
          index * 100 // 100ms delay between each request
        )
      )
    );
    
    const results = await Promise.all(promises);

    // Flatten and filter available units
    const availableUnits = results.flat().filter(unit => unit.available);
    
    console.log(`[TrackSolid API] ${availableUnits.length} of ${imeis.length} units available`);
    
    return availableUnits;
  }
};
