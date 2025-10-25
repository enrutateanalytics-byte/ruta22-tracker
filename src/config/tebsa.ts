// TEBSA API Configuration
export const TEBSA_CONFIG = {
  API_URL: "https://wstijuana45da56.nrtec-sys.com/tebsa/getUbicacion",
  API_KEY: "6eiWLiJI3l0vWOSKPq", // TEBSA API key configured
  UNIT_ID: 38104504, // ID de la unidad GPS para Ruta 22
  POLLING_INTERVAL: 30000, // 30 seconds
  FALLBACK_TO_SIMULATION: true, // Enable simulation when API is not available
};

// Helper to check if TEBSA API is configured
export const isTebsaConfigured = () => {
  return TEBSA_CONFIG.API_KEY.length > 0;
};