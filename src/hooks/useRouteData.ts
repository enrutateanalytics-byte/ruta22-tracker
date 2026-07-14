import { useState, useEffect } from 'react';
import { routeService, type CompleteRoute } from '@/services/routeService';
import { tebsaApi, type TebsaUnit } from '@/services/tebsaApi';
import { trackSolidApi, type TrackSolidUnit } from '@/services/trackSolidApi';
import { gpsUnitsService } from '@/services/gpsUnitsService';
import { appSettingsService } from '@/services/appSettingsService';
import { TEBSA_CONFIG } from '@/config/tebsa';

interface UseRouteDataReturn {
  // Routes data
  routes: CompleteRoute[];
  currentRoute: CompleteRoute | null;
  setCurrentRoute: (route: CompleteRoute | null) => void;
  
  // Bus tracking
  busUnits: TebsaUnit[];
  isApiConnected: boolean;
  lastUpdate: Date | null;
  apiError: string | null;
  isRetrying: boolean;
  
  // Loading states
  isLoadingRoutes: boolean;
  routesError: string | null;
}

export const useRouteData = (): UseRouteDataReturn => {
  // Routes state
  const [routes, setRoutes] = useState<CompleteRoute[]>([]);
  const [currentRoute, setCurrentRoute] = useState<CompleteRoute | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);
  
  // Bus tracking state - ONLY real API data, no simulation
  const [busUnits, setBusUnits] = useState<TebsaUnit[]>([]);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Load routes from Supabase
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoadingRoutes(true);
        setRoutesError(null);
        const fetchedRoutes = await routeService.getAllRoutes();
        setRoutes(fetchedRoutes);
        
        // Set real route as default - prefer M1 R18, then Ruta 22, then any available
        const defaultRoute = fetchedRoutes.find(route => 
          route.name.includes('M1 R18')
        ) || fetchedRoutes.find(route => 
          route.name.includes('Ruta 22')
        );
        setCurrentRoute(defaultRoute || fetchedRoutes[0] || null);
        
        console.log(`[useRouteData] Loaded ${fetchedRoutes.length} routes from database`);
      } catch (error) {
        console.error('[useRouteData] Failed to load routes:', error);
        setRoutesError(error instanceof Error ? error.message : 'Error loading routes');
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    loadRoutes();
  }, []);

  // Check if current time is within service hours (Tijuana time: 4:30 AM - 10:00 PM, every day)
  const isWithinServiceHours = (): boolean => {
    const tijuanaTime = new Date().toLocaleString('en-US', { timeZone: 'America/Tijuana' });
    const now = new Date(tijuanaTime);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 4 * 60 + 30; // 4:30 AM
    const endMinutes = 22 * 60; // 10:00 PM
    return totalMinutes >= startMinutes && totalMinutes < endMinutes;
  };

  // Real-time bus location polling
  useEffect(() => {
    if (!currentRoute) return;

    const fetchBusLocations = async () => {
      // Silently skip GPS fetch outside service hours
      if (!isWithinServiceHours()) {
        console.log('[useRouteData] Outside service hours (Tijuana 4:30 AM - 10:00 PM), skipping GPS fetch');
        setBusUnits([]);
        setIsApiConnected(false);
        setLastUpdate(new Date());
        return;
      }

      try {
        setApiError(null);
        console.log('[useRouteData] Fetching bus data from GPS providers...');
        
        const [tebsaUnits, trackSolidUnits, economicNumberMap] = await Promise.all([
          gpsUnitsService.getUnitsByProvider('tebsa'),
          gpsUnitsService.getUnitsByProvider('tracksolid'),
          gpsUnitsService.getImeiToEconomicNumberMap()
        ]);

        const [tebsaLocations, trackSolidLocations] = await Promise.all([
          tebsaUnits.length > 0 
            ? Promise.all(tebsaUnits.map(unit => 
                tebsaApi.getUnitLocation(unit.imei)
              )).then(results => results.flat())
            : Promise.resolve([]),
          trackSolidUnits.length > 0 
            ? trackSolidApi.getBatchLocations(
                trackSolidUnits.map(unit => unit.imei)
              )
            : Promise.resolve([])
        ]);

        const transformedTrackSolidUnits: TebsaUnit[] = trackSolidLocations.map(unit => ({
          id: unit.id.toString(),
          latitud: unit.lat,
          longitud: unit.lng,
          velocidad: unit.speed,
          orientacion: unit.orientation,
          disponible: unit.available,
          economicNumber: economicNumberMap.get(unit.id)
        }));

        const allUnits: TebsaUnit[] = [
          ...tebsaLocations.map(unit => ({
            ...unit,
            economicNumber: economicNumberMap.get(parseInt(unit.id))
          })),
          ...transformedTrackSolidUnits
        ];
        
        if (allUnits.length > 0) {
          setBusUnits(allUnits);
          setIsApiConnected(true);
          setIsRetrying(false);
          setLastUpdate(new Date());
        } else {
          setBusUnits([]);
          setIsApiConnected(false);
          setLastUpdate(new Date());
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[useRouteData] GPS API error:', errorMessage);
        setApiError(errorMessage);
        setIsApiConnected(false);
        setIsRetrying(false);
        setBusUnits([]);
      }
    };

    fetchBusLocations();
    const interval = setInterval(fetchBusLocations, TEBSA_CONFIG.POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [currentRoute]);

  return {
    // Routes data
    routes,
    currentRoute,
    setCurrentRoute,
    
    // Bus tracking
    busUnits,
    isApiConnected,
    lastUpdate,
    apiError,
    isRetrying,
    
    // Loading states
    isLoadingRoutes,
    routesError,
  };
};