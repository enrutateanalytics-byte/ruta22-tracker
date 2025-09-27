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

// Enhanced debugging and retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const tebsaApi = {
  /**
   * Get location for all units (id=0) or specific unit with retry logic
   */
  async getUnitLocation(unitId: number = 0, retryCount: number = 0): Promise<TebsaUnit[]> {
    if (!isTebsaConfigured()) {
      throw new Error("TEBSA API key not configured");
    }

    const requestUrl = `${TEBSA_API_URL}?id=${unitId}&apikey=${TEBSA_API_KEY}`;
    
    console.log(`[TEBSA API] Attempting to fetch data from: ${requestUrl}`);
    console.log(`[TEBSA API] Retry attempt: ${retryCount + 1}/${MAX_RETRIES + 1}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`[TEBSA API] Response status: ${response.status}`);
      console.log(`[TEBSA API] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log(`[TEBSA API] Raw response:`, responseText);

      let data: TebsaApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[TEBSA API] Failed to parse JSON response:", parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log(`[TEBSA API] Parsed response:`, data);
      
      // Handle API response codes
      switch (data.codigo) {
        case 1: // Disponible
          if (data.latitud && data.longitud) {
            const unit: TebsaUnit = {
              id: unitId === 0 ? 'auto' : unitId.toString(),
              latitud: data.latitud,
              longitud: data.longitud,
              velocidad: data.velocidad || 0,
              orientacion: data.orientacion || 0,
              disponible: true
            };
            console.log(`[TEBSA API] Successfully received unit data:`, unit);
            return [unit];
          }
          console.warn("[TEBSA API] Unit available but no coordinates provided");
          return [];
          
        case 2: // No disponible
          console.warn(`[TEBSA API] Unit ${unitId} not available: ${data.mensaje}`);
          return [];
          
        case 3: // Error parámetros
          console.error("[TEBSA API] Parameter error:", data.mensaje);
          throw new Error(`Parameter error: ${data.mensaje}`);
          
        case 4: // Error interno
          console.error("[TEBSA API] Internal server error:", data.mensaje);
          throw new Error(`Internal server error: ${data.mensaje}`);
          
        default:
          console.error("[TEBSA API] Unknown response code:", data.codigo, data.mensaje);
          throw new Error(`Unknown response code: ${data.codigo} - ${data.mensaje}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[TEBSA API] Request failed (attempt ${retryCount + 1}):`, errorMessage);
      
      // Check if this is a network/connectivity error that we should retry
      const isRetryableError = errorMessage.includes('Failed to fetch') || 
                              errorMessage.includes('NetworkError') ||
                              errorMessage.includes('TypeError') ||
                              errorMessage.includes('AbortError') ||
                              errorMessage.startsWith('HTTP 5');
      
      if (isRetryableError && retryCount < MAX_RETRIES) {
        const delayTime = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`[TEBSA API] Retrying in ${delayTime}ms...`);
        await delay(delayTime);
        return this.getUnitLocation(unitId, retryCount + 1);
      }
      
      // Add context to the error for better debugging
      const enhancedError = new Error(`TEBSA API Error: ${errorMessage} (after ${retryCount + 1} attempts)`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).requestUrl = requestUrl;
      (enhancedError as any).retryCount = retryCount + 1;
      
      throw enhancedError;
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