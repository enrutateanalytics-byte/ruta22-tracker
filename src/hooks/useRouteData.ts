import { useState, useEffect } from 'react';
import { routeService, type CompleteRoute } from '@/services/routeService';
import { tebsaApi, type TebsaUnit } from '@/services/tebsaApi';
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
  
  // Simulation fallback
  simulatedBusPosition: { lat: number; lng: number };
  
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
  
  // Bus tracking state
  const [busUnits, setBusUnits] = useState<TebsaUnit[]>([]);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Simulation state
  const [simulatedBusPosition, setSimulatedBusPosition] = useState({ lat: 32.5, lng: -117 });
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);

  // Load routes from Supabase
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoadingRoutes(true);
        setRoutesError(null);
        const fetchedRoutes = await routeService.getAllRoutes();
        setRoutes(fetchedRoutes);
        
        // Set M1 R18 as default route if available
        const m1Route = fetchedRoutes.find(route => 
          route.name.includes('M1 R18') || route.name.includes('Apoyo Urbi')
        );
        setCurrentRoute(m1Route || fetchedRoutes[0] || null);
        
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

  // Initialize simulation position when route changes
  useEffect(() => {
    if (currentRoute?.points && currentRoute.points.length > 0) {
      setSimulatedBusPosition({
        lat: currentRoute.points[0].latitude,
        lng: currentRoute.points[0].longitude
      });
      setCurrentRouteIndex(0);
    }
  }, [currentRoute]);

  // Fetch real-time bus locations from TEBSA API
  useEffect(() => {
    if (!currentRoute) return;

    const fetchBusLocations = async () => {
      try {
        setApiError(null);
        const units = await tebsaApi.getM1R18Units();
        setBusUnits(units);
        setIsApiConnected(true);
        setIsRetrying(false);
        setLastUpdate(new Date());
        console.log(`[useRouteData] Successfully fetched ${units.length} units from TEBSA API`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn("[useRouteData] TEBSA API not available, using simulation:", errorMessage);
        
        // Check if this is a retry attempt
        if (errorMessage.includes('after') && errorMessage.includes('attempts')) {
          setIsRetrying(true);
          setApiError(`Conexión fallida: ${errorMessage.split(':')[1]?.trim() || errorMessage}`);
        } else {
          setApiError(errorMessage);
        }
        
        setIsApiConnected(false);
        setIsRetrying(false);
        
        // Fallback to simulation
        if (currentRoute?.points.length) {
          setCurrentRouteIndex(prev => {
            const nextIndex = (prev + 1) % currentRoute.points.length;
            setSimulatedBusPosition({
              lat: currentRoute.points[nextIndex].latitude,
              lng: currentRoute.points[nextIndex].longitude
            });
            return nextIndex;
          });
        }
      }
    };

    // Initial fetch
    fetchBusLocations();

    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchBusLocations, TEBSA_CONFIG.POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [currentRoute]);

  // Fallback simulation when API is not available
  useEffect(() => {
    if (isApiConnected || !currentRoute?.points.length) return;
    
    const interval = setInterval(() => {
      setCurrentRouteIndex(prev => {
        const nextIndex = (prev + 1) % currentRoute.points.length;
        setSimulatedBusPosition({
          lat: currentRoute.points[nextIndex].latitude,
          lng: currentRoute.points[nextIndex].longitude
        });
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentRoute, isApiConnected]);

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
    
    // Simulation fallback
    simulatedBusPosition,
    
    // Loading states
    isLoadingRoutes,
    routesError,
  };
};