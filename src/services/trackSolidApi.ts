export interface TrackSolidUnit {
  id: number;
  lat: number;
  lng: number;
  speed: number;
  orientation: number;
  available: boolean;
}

export interface TrackSolidBatchResponse {
  success: boolean;
  count: number;
  units: {
    imei: string;
    codigo: number;
    mensaje: string;
    latitud: number;
    longitud: number;
    velocidad: number;
    orientacion: number;
  }[];
}

const PROXY_URL = "https://pfbkwcuuqowllpnxokxh.supabase.co/functions/v1/tracksolid-proxy";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYmt3Y3V1cW93bGxwbnhva3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTU4NDcsImV4cCI6MjA3NDUzMTg0N30.SAL7nBlINRqBvn6wc5V8WT81ID_Y4PIPMHdbZaJJgPQ";

export const trackSolidApi = {
  /**
   * Fetch location data for ALL units in a single batch call
   * Uses jimi.user.device.location.list which has 86,400 calls/day limit
   * This is 10x more than individual calls and returns all locations at once
   */
  async getBatchLocations(imeis: number[]): Promise<TrackSolidUnit[]> {
    if (imeis.length === 0) return [];

    try {
      const imeiString = imeis.join(',');
      console.log(`[TrackSolid API] Batch request for ${imeis.length} units`);

      const url = `${PROXY_URL}?mode=batch&imeis=${imeiString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Edge Function returned status ${response.status}`);
      }

      const data = await response.json() as TrackSolidBatchResponse;

      if (!data.success || !data.units) {
        console.warn('[TrackSolid API] Batch request failed:', data);
        return [];
      }

      // Transform to TrackSolidUnit format, filtering only available units
      const availableUnits: TrackSolidUnit[] = data.units
        .filter(unit => unit.codigo === 1)
        .map(unit => ({
          id: parseInt(unit.imei),
          lat: unit.latitud,
          lng: unit.longitud,
          speed: unit.velocidad,
          orientation: unit.orientacion,
          available: true,
        }));

      console.log(`[TrackSolid API] Batch: ${availableUnits.length} of ${imeis.length} units available`);
      return availableUnits;

    } catch (error) {
      console.error('[TrackSolid API] Batch error:', error);
      return [];
    }
  },

  /**
   * @deprecated Use getBatchLocations instead for better performance
   * Kept for backward compatibility
   */
  async getMultipleUnitsLocation(imeis: number[]): Promise<TrackSolidUnit[]> {
    return this.getBatchLocations(imeis);
  },

  /**
   * @deprecated Use getBatchLocations instead
   * Fetch location for a single unit
   */
  async getUnitLocation(imei: number): Promise<TrackSolidUnit[]> {
    return this.getBatchLocations([imei]);
  }
};
