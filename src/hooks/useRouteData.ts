import { useState, useEffect } from 'react';
import { routeService, type CompleteRoute } from '@/services/routeService';
import { tebsaApi, type TebsaUnit } from '@/services/tebsaApi';
import { trackSolidApi, type TrackSolidUnit } from '@/services/trackSolidApi';
import { gpsUnitsService } from '@/services/gpsUnitsService';
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

  // No simulation - only real API data

  // Fetch real-time bus locations from both TEBSA and TrackSolid APIs
  useEffect(() => {
    if (!currentRoute) return;

    const fetchBusLocations = async () => {
      try {
        setApiError(null);
        console.log('[useRouteData] Fetching bus data from GPS providers...');
        
        // Get units by provider from database
        const [tebsaUnits, trackSolidUnits, economicNumberMap] = await Promise.all([
          gpsUnitsService.getUnitsByProvider('tebsa'),
          gpsUnitsService.getUnitsByProvider('tracksolid'),
          gpsUnitsService.getImeiToEconomicNumberMap()
        ]);

        console.log(`[useRouteData] Found ${tebsaUnits.length} TEBSA units, ${trackSolidUnits.length} TrackSolid units`);

        // Fetch locations from both providers in parallel
        const [tebsaLocations, trackSolidLocations] = await Promise.all([
          tebsaUnits.length > 0 
            ? Promise.all(tebsaUnits.map(unit => 
                tebsaApi.getUnitLocation(unit.imei)
              )).then(results => results.flat())
            : Promise.resolve([]),
          // Temporarily disabled TrackSolid due to rate limiting - will re-enable after cooldown period
          Promise.resolve([])
        ]);

        // Transform TrackSolid units to TebsaUnit format for compatibility
        const transformedTrackSolidUnits: TebsaUnit[] = trackSolidLocations.map(unit => ({
          id: unit.id.toString(),
          latitud: unit.lat,
          longitud: unit.lng,
          velocidad: unit.speed,
          orientacion: unit.orientation,
          disponible: unit.available,
          economicNumber: economicNumberMap.get(unit.id)
        }));

        // Combine results from both providers
        const allUnits: TebsaUnit[] = [
          ...tebsaLocations.map(unit => ({
            ...unit,
            economicNumber: economicNumberMap.get(parseInt(unit.id))
          })),
          ...transformedTrackSolidUnits
        ];
        
        if (allUnits.length > 0) {
          console.log(`[useRouteData] Successfully fetched ${allUnits.length} units (${tebsaLocations.length} TEBSA, ${trackSolidLocations.length} TrackSolid)`);
          setBusUnits(allUnits);
          setIsApiConnected(true);
          setIsRetrying(false);
          setLastUpdate(new Date());
        } else {
          console.warn('[useRouteData] No units available from any provider');
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

    // Initial fetch
    fetchBusLocations();

    // Set up polling every 30 seconds for real-time updates
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