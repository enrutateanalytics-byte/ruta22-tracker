import { useState, useEffect } from "react";
import { GoogleMapContainer } from "@/components/transport/GoogleMapContainer";
import { GoogleBusMarker } from "@/components/transport/GoogleBusMarker";
import { GoogleStopMarker } from "@/components/transport/GoogleStopMarker";
import { GoogleRoutePolyline } from "@/components/transport/GoogleRoutePolyline";
import { parseKMLFile, type ParsedRoute } from "@/utils/kmlParser";
import { tebsaApi, type TebsaUnit } from "@/services/tebsaApi";
import { TEBSA_CONFIG } from "@/config/tebsa";
import { Button } from "@/components/ui/button";
import { X, Wifi, WifiOff } from "lucide-react";

export const MapView = () => {
  const [routeData, setRouteData] = useState<ParsedRoute | null>(null);
  const [busUnits, setBusUnits] = useState<TebsaUnit[]>([]);
  const [selectedStop, setSelectedStop] = useState<ParsedRoute['stops'][0] | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Fallback simulation state (when API is not available)
  const [busPosition, setBusPosition] = useState({ lat: 32.5, lng: -117 });
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);

  // Load KML data on component mount
  useEffect(() => {
    parseKMLFile().then(data => {
      setRouteData(data);
      if (data.points.length > 0) {
        setBusPosition(data.points[0]);
      }
    });
  }, []);

  // Fetch real-time bus locations from TEBSA API
  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        const units = await tebsaApi.getM1R18Units();
        setBusUnits(units);
        setIsApiConnected(true);
        setLastUpdate(new Date());
      } catch (error) {
        console.warn("TEBSA API not available, using simulation:", error);
        setIsApiConnected(false);
        // Fallback to simulation
        if (routeData?.points.length) {
          setCurrentRouteIndex(prev => {
            const nextIndex = (prev + 1) % routeData.points.length;
            setBusPosition(routeData.points[nextIndex]);
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
  }, [routeData]);

  // Fallback simulation when API is not available
  useEffect(() => {
    if (isApiConnected || !routeData?.points.length) return;
    
    const interval = setInterval(() => {
      setCurrentRouteIndex(prev => {
        const nextIndex = (prev + 1) % routeData.points.length;
        setBusPosition(routeData.points[nextIndex]);
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [routeData, isApiConnected]);

  if (!routeData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando ruta...</p>
        </div>
      </div>
    );
  }

  // Calculate next stop based on current position
  const getNextStop = () => {
    if (isApiConnected && busUnits.length > 0) {
      // For real units, find closest stop (simplified logic)
      const firstUnit = busUnits[0];
      return routeData?.stops[0]; // Simplified - should calculate closest stop
    } else {
      // Fallback simulation logic
      return routeData?.stops.find((_, index) => index === Math.floor(currentRouteIndex / (routeData?.points.length! / routeData?.stops.length!)));
    }
  };
  
  const nextStop = getNextStop();

  return (
    <div className="relative h-full">
      <GoogleMapContainer 
        center={{ lat: 32.4427, lng: -116.9883 }} // Centro de Tijuana
        zoom={13}
      >
        {/* Línea de la ruta */}
        <GoogleRoutePolyline points={routeData.points} />
        
        {/* Paradas */}
        {routeData.stops.map((stop) => (
          <GoogleStopMarker
            key={stop.id}
            stop={stop}
            isSelected={selectedStop?.id === stop.id}
            onClick={() => setSelectedStop(selectedStop?.id === stop.id ? null : stop)}
          />
        ))}
        
        {/* Autobuses en tiempo real o simulación */}
        {isApiConnected && busUnits.length > 0 ? (
          busUnits.map((unit, index) => (
            <GoogleBusMarker
              key={`unit-${unit.id}`}
              position={{ lat: unit.latitud, lng: unit.longitud }}
              velocity={unit.velocidad}
              orientation={unit.orientacion}
              unitId={unit.id}
            />
          ))
        ) : (
          <GoogleBusMarker position={busPosition} />
        )}
      </GoogleMapContainer>

      {/* Status bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-card-soft px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isApiConnected ? (
                <Wifi className="w-4 h-4 text-primary" />
              ) : (
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              )}
              <div className={`w-3 h-3 rounded-full ${isApiConnected ? 'bg-primary animate-pulse' : 'bg-secondary'}`}></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">
                  {isApiConnected && busUnits.length > 0 
                    ? `${busUnits.length} unidad${busUnits.length > 1 ? 'es' : ''} en servicio`
                    : 'Unidad en servicio (simulación)'
                  }
                </p>
                {isApiConnected && lastUpdate && (
                  <p className="text-xs text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Próxima parada: {nextStop?.name || 'Calculando...'}
                </p>
                {isApiConnected && busUnits.length > 0 && (
                  <p className="text-xs text-primary font-medium">
                    {Math.round(busUnits[0].velocidad)} km/h
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stop popup */}
      {selectedStop && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-transport border border-primary/20 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-primary">{selectedStop.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStop(null)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-sm text-muted-foreground">
                Tiempo estimado: <span className="font-medium text-secondary">{selectedStop.eta}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};