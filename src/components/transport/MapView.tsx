import { useState } from "react";
import { GoogleMapContainer } from "@/components/transport/GoogleMapContainer";
import { GoogleBusMarker } from "@/components/transport/GoogleBusMarker";
import { GoogleStopMarker } from "@/components/transport/GoogleStopMarker";
import { GoogleRoutePolyline } from "@/components/transport/GoogleRoutePolyline";
import { useRouteData } from "@/hooks/useRouteData";
import { Button } from "@/components/ui/button";
import { X, Wifi, WifiOff } from "lucide-react";
import { type CompleteRoute } from "@/services/routeService";

interface MapViewProps {
  currentRoute?: CompleteRoute;
}

export const MapView = ({ currentRoute: propCurrentRoute }: MapViewProps = {}) => {
  const { 
    currentRoute: hookCurrentRoute, 
    busUnits, 
    isApiConnected, 
    lastUpdate, 
    apiError, 
    isRetrying,
    simulatedBusPosition,
    isLoadingRoutes 
  } = useRouteData();
  
  // Use prop route if provided, otherwise use hook route
  const currentRoute = propCurrentRoute || hookCurrentRoute;
  const [selectedStop, setSelectedStop] = useState<CompleteRoute['stops'][0] | null>(null);

  if (isLoadingRoutes) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando rutas...</p>
        </div>
      </div>
    );
  }

  if (!currentRoute) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No hay rutas disponibles</p>
        </div>
      </div>
    );
  }

  // Calculate next stop based on current position
  const getNextStop = () => {
    if (isApiConnected && busUnits.length > 0) {
      // For real units, find closest stop (simplified logic)
      return currentRoute.stops[0]; // Simplified - should calculate closest stop
    } else {
      // Fallback simulation logic - find closest stop to simulated position
      if (!currentRoute.stops.length) return null;
      
      let closestStop = currentRoute.stops[0];
      let minDistance = Infinity;
      
      currentRoute.stops.forEach(stop => {
        const distance = Math.sqrt(
          Math.pow(stop.latitude - simulatedBusPosition.lat, 2) + 
          Math.pow(stop.longitude - simulatedBusPosition.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestStop = stop;
        }
      });
      
      return closestStop;
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
        {currentRoute.points.length > 0 && (
          <GoogleRoutePolyline 
            points={currentRoute.points.map(point => ({ 
              lat: point.latitude, 
              lng: point.longitude 
            }))} 
            color={currentRoute.color}
          />
        )}
        
        {/* Paradas */}
        {currentRoute.stops.map((stop) => (
          <GoogleStopMarker
            key={stop.id}
            stop={{
              id: stop.order_index,
              name: stop.name,
              lat: stop.latitude,
              lng: stop.longitude,
              eta: '5 min'
            }}
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
          <GoogleBusMarker position={simulatedBusPosition} />
        )}
      </GoogleMapContainer>

      {/* Status bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-card-soft px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isApiConnected ? (
                <Wifi className="w-4 h-4 text-primary" />
              ) : isRetrying ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" />
              )}
              <div className={`w-3 h-3 rounded-full ${
                isApiConnected ? 'bg-primary animate-pulse' : 
                isRetrying ? 'bg-yellow-500 animate-pulse' : 
                'bg-destructive'
              }`}></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">
                  {isApiConnected && busUnits.length > 0 
                    ? `${busUnits.length} unidad${busUnits.length > 1 ? 'es' : ''} en tiempo real`
                    : isRetrying 
                    ? 'Reintentando conexión...'
                    : 'Modo simulación'
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
                  {apiError && !isApiConnected ? (
                    <span className="text-destructive">Error: {apiError}</span>
                  ) : (
                    `Próxima parada: ${nextStop?.name || 'Calculando...'}`
                  )}
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
                Tiempo estimado: <span className="font-medium text-secondary">5 min</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};