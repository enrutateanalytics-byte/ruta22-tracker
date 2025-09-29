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
  
  // Simulation state for 6 bus units
  const [simulatedUnits, setSimulatedUnits] = useState<TebsaUnit[]>([]);
  const [simulationStep, setSimulationStep] = useState(0);

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

  // Initialize simulation units when route changes
  useEffect(() => {
    if (currentRoute?.points && currentRoute.points.length > 0) {
      // Create 6 simulated bus units distributed along the route
      const createSimulatedUnits = (): TebsaUnit[] => {
        const totalPoints = currentRoute.points.length;
        const units: TebsaUnit[] = [];
        
        for (let i = 0; i < 6; i++) {
          // Distribute units along the route with some spacing
          const pointIndex = Math.floor((i * totalPoints) / 6);
          const point = currentRoute.points[pointIndex];
          
          units.push({
            id: `unit_${String(i + 1).padStart(3, '0')}`,
            latitud: point.latitude,
            longitud: point.longitude,
            velocidad: 35 + Math.random() * 15, // 35-50 km/h
            orientacion: Math.floor(Math.random() * 360),
            disponible: true
          });
        }
        
        return units;
      };
      
      const newSimulatedUnits = createSimulatedUnits();
      setSimulatedUnits(newSimulatedUnits);
      
      // Set simulation units as active immediately
      setBusUnits(newSimulatedUnits);
      setIsApiConnected(true);
      setLastUpdate(new Date());
      setSimulationStep(0);
      
      console.log(`[useRouteData] Started simulation with ${newSimulatedUnits.length} units`);
    }
  }, [currentRoute]);

  // Fetch real-time bus locations from TEBSA API (disabled - using simulation)
  useEffect(() => {
    if (!currentRoute) return;

    // Commented out to use simulation directly
    /*
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
        
        // Switch to simulation mode with 6 units
        if (simulatedUnits.length > 0) {
          setBusUnits(simulatedUnits);
          setIsApiConnected(true); // Show as connected for UI purposes
          setLastUpdate(new Date());
          console.log(`[useRouteData] Switched to simulation mode with ${simulatedUnits.length} units`);
        }
      }
    };

    // Initial fetch
    fetchBusLocations();

    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchBusLocations, TEBSA_CONFIG.POLLING_INTERVAL);

    return () => clearInterval(interval);
    */
  }, [currentRoute, simulatedUnits]);

  // Move simulated units along the route
  useEffect(() => {
    if (!simulatedUnits.length || !currentRoute?.points.length) return;
    
    const interval = setInterval(() => {
      setSimulationStep(prev => {
        const nextStep = (prev + 1) % 100; // Full cycle in 100 steps
        
        // Update simulated units positions
        const updatedUnits = simulatedUnits.map((unit, index) => {
          const totalPoints = currentRoute.points.length;
          // Each unit has a different offset to spread them out
          const baseIndex = Math.floor((index * totalPoints) / 6);
          const stepOffset = Math.floor((nextStep * totalPoints) / 100);
          const currentIndex = (baseIndex + stepOffset) % totalPoints;
          const point = currentRoute.points[currentIndex];
          
          return {
            ...unit,
            latitud: point.latitude,
            longitud: point.longitude,
            velocidad: 35 + Math.random() * 15, // Vary speed slightly
            orientacion: Math.floor(Math.random() * 360)
          };
        });
        
        setSimulatedUnits(updatedUnits);
        
        // Update busUnits with the new positions
        setBusUnits(updatedUnits);
        setLastUpdate(new Date());
        
        return nextStep;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [simulatedUnits, currentRoute]);

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