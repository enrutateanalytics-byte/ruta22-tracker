// TEBSA API Configuration
export const TEBSA_CONFIG = {
  API_URL: "https://wstijuana45da56.nrtec-sys.com/tebsa/getUbicacion",
  API_KEY: "6eiWLiJI3l0vWOSKPq", // TEBSA API key configured
  UNIT_IDS: [
    53502533,  // Unidad GPS activa
    51301501,  // Unidad GPS activa
    62704513,  // Unidad GPS activa
    15805513,  // Unidad GPS activa
    43808530,  // Unidad GPS activa
    9403503,   // Unidad GPS activa
    5305593,   // Unidad GPS activa
    98003544,  // Unidad GPS activa
    64003519,  // Unidad GPS activa
  ],
  POLLING_INTERVAL: 30000, // 30 seconds
  FALLBACK_TO_SIMULATION: true, // Enable simulation when API is not available
};

// Helper to check if TEBSA API is configured
export const isTebsaConfigured = () => {
  return TEBSA_CONFIG.API_KEY.length > 0;
};