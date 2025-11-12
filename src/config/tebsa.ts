// TEBSA API Configuration
export const TEBSA_CONFIG = {
  API_URL: "https://wstijuana45da56.nrtec-sys.com/tebsa/getUbicacion",
  API_KEY: "6eiWLiJI3l0vWOSKPq", // TEBSA API key configured
  UNIT_IDS: [
    38104504,  // Unidad confirmada que funciona
    // Las siguientes unidades devuelven 404 del API TEBSA - verificar IDs:
    // 53502533, 51301501, 62704513, 15805513, 43808530, 
    // 9403503, 5305593, 98003544, 64003519
  ],
  POLLING_INTERVAL: 30000, // 30 seconds
  FALLBACK_TO_SIMULATION: true, // Enable simulation when API is not available
};

// Helper to check if TEBSA API is configured
export const isTebsaConfigured = () => {
  return TEBSA_CONFIG.API_KEY.length > 0;
};