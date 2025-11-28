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

      const { data, error } = await supabase.functions.invoke('tracksolid-proxy', {
        method: 'GET',
        // @ts-ignore - Supabase types don't include query params properly
        query: { imei: imei.toString() }
      });

      if (error) {
        throw new Error(`[TrackSolid API] Error: ${error.message}`);
      }

      const response = data as TrackSolidApiResponse;

      // Transform response to unit format
      if (response.codigo === 1 && response.mensaje === "Disponible") {
        return [{
          id: imei,
          lat: response.latitud,
          lng: response.longitud,
          speed: response.velocidad,
          orientation: response.orientacion,
          available: true,
        }];
      }

      console.log(`[TrackSolid API] Unit ${imei} not available: ${response.mensaje}`);
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

    const promises = imeis.map(imei => this.getUnitLocation(imei));
    const results = await Promise.all(promises);

    // Flatten and filter available units
    const availableUnits = results.flat().filter(unit => unit.available);
    
    console.log(`[TrackSolid API] ${availableUnits.length} of ${imeis.length} units available`);
    
    return availableUnits;
  }
};
