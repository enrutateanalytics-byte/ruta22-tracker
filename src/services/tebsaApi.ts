import { TEBSA_CONFIG, isTebsaConfigured } from "@/config/tebsa";

interface TebsaApiResponse {
  codigo: number; // 1=Disponible, 2=No disponible, 3=Error parámetros, 4=Error interno
  mensaje: string;
  latitud?: number;
  longitud?: number;
  velocidad?: number;
  orientacion?: number; // Degrees 0-360
}

interface TebsaUnit {
  id: string;
  latitud: number;
  longitud: number;
  velocidad: number;
  orientacion: number;
  disponible: boolean;
}

const TEBSA_API_URL = TEBSA_CONFIG.API_URL;
const TEBSA_API_KEY = TEBSA_CONFIG.API_KEY;

export const tebsaApi = {
  /**
   * Get location for all units (id=0) or specific unit
   */
  async getUnitLocation(unitId: number = 0): Promise<TebsaUnit[]> {
    if (!isTebsaConfigured()) {
      throw new Error("TEBSA API key not configured");
    }

    try {
      const response = await fetch(`${TEBSA_API_URL}?id=${unitId}&apikey=${TEBSA_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TebsaApiResponse = await response.json();
      
      // Handle API response codes
      switch (data.codigo) {
        case 1: // Disponible
          if (data.latitud && data.longitud) {
            return [{
              id: unitId.toString(),
              latitud: data.latitud,
              longitud: data.longitud,
              velocidad: data.velocidad || 0,
              orientacion: data.orientacion || 0,
              disponible: true
            }];
          }
          return [];
          
        case 2: // No disponible
          console.warn(`Unit ${unitId} not available:`, data.mensaje);
          return [];
          
        case 3: // Error parámetros
          console.error("TEBSA API parameter error:", data.mensaje);
          throw new Error(`Parameter error: ${data.mensaje}`);
          
        case 4: // Error interno
          console.error("TEBSA API internal error:", data.mensaje);
          throw new Error(`Internal error: ${data.mensaje}`);
          
        default:
          console.error("Unknown TEBSA API response code:", data.codigo);
          throw new Error(`Unknown response code: ${data.codigo}`);
      }
    } catch (error) {
      console.error("Error fetching unit location:", error);
      throw error;
    }
  },

  /**
   * Get locations for specific M1 R18 route units
   */
  async getM1R18Units(): Promise<TebsaUnit[]> {
    // For now, try to get all units (id=0)
    // In the future, we might need specific unit IDs for M1 R18 route
    return this.getUnitLocation(0);
  }
};

export type { TebsaUnit, TebsaApiResponse };