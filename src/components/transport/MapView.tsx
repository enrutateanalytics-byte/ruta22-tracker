import { useState, useEffect, useRef } from "react";
import { GoogleMapContainer } from "@/components/transport/GoogleMapContainer";
import { GoogleBusMarker } from "@/components/transport/GoogleBusMarker";
import { GoogleStopMarker } from "@/components/transport/GoogleStopMarker";
import { GoogleRoutePolyline } from "@/components/transport/GoogleRoutePolyline";
import { GoogleUserLocationMarker } from "@/components/transport/GoogleUserLocationMarker";
import { useRouteData } from "@/hooks/useRouteData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import { X, MapPin, Loader2 } from "lucide-react";
import { type CompleteRoute } from "@/services/routeService";
import { toast } from "sonner";

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
    isLoadingRoutes 
  } = useRouteData();
  
  // Use prop route if provided, otherwise use hook route
  const currentRoute = propCurrentRoute || hookCurrentRoute;
  const [selectedStop, setSelectedStop] = useState<CompleteRoute['stops'][0] | null>(null);
  
  // Geolocation
  const { position, error, loading, getCurrentPosition, watchPosition } = useGeolocation(true);
  const watchIdRef = useRef<any>(null);

  // Get user location on mount and watch for updates
  useEffect(() => {
    const initLocation = async () => {
      try {
        await getCurrentPosition();
        
        // Start watching position
        const watchId = await watchPosition((newPosition) => {
          // Position updates are handled automatically by the hook
        });
        
        watchIdRef.current = watchId;
      } catch (err) {
        console.error('[MapView] Failed to get user location:', err);
        toast.error('No se pudo obtener tu ubicación');
      }
    };

    initLocation();

    // Cleanup
    return () => {
      if (watchIdRef.current?.remove) {
        watchIdRef.current.remove();
      }
    };
  }, []);

  // Center map on user location
  const centerOnUserLocation = async () => {
    try {
      const newPosition = await getCurrentPosition();
      
      // Center the map
      const mapElement = document.querySelector('[data-map]') as any;
      if (mapElement?.mapInstance && newPosition) {
        mapElement.mapInstance.setCenter({
          lat: newPosition.coords.latitude,
          lng: newPosition.coords.longitude
        });
        mapElement.mapInstance.setZoom(15);
        toast.success('Centrado en tu ubicación');
      }
    } catch (err) {
      toast.error('No se pudo obtener tu ubicación');
    }
  };

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
      // Use the first bus unit position to calculate next stop
      const firstUnit = busUnits[0];
      if (!currentRoute.stops.length) return null;
      
      let closestStop = currentRoute.stops[0];
      let minDistance = Infinity;
      
      currentRoute.stops.forEach(stop => {
        const distance = Math.sqrt(
          Math.pow(stop.latitude - firstUnit.latitud, 2) + 
          Math.pow(stop.longitude - firstUnit.longitud, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestStop = stop;
        }
      });
      
      return closestStop;
    } else {
      // Fallback when no units available
      return currentRoute.stops[0] || null;
    }
  };
  
  const nextStop = getNextStop();

  // Calculate map center based on route points
  const getRouteCenter = () => {
    if (!currentRoute.points.length) {
      return { lat: 32.4427, lng: -116.9883 }; // Fallback to Tijuana center
    }
    
    const sumLat = currentRoute.points.reduce((sum, point) => sum + point.latitude, 0);
    const sumLng = currentRoute.points.reduce((sum, point) => sum + point.longitude, 0);
    
    return {
      lat: sumLat / currentRoute.points.length,
      lng: sumLng / currentRoute.points.length
    };
  };

  return (
    <div className="relative h-full">
      <GoogleMapContainer 
        center={getRouteCenter()}
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
        
        {/* Autobuses en tiempo real */}
        {busUnits.length > 0 ? (
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
          <div /> // No buses to show
        )}

        {/* User location marker */}
        {position && (
          <GoogleUserLocationMarker
            position={{
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }}
            accuracy={position.coords.accuracy}
          />
        )}
      </GoogleMapContainer>

      {/* Center on user location button */}
      <Button
        onClick={centerOnUserLocation}
        disabled={loading}
        className="absolute top-4 right-4 z-10 h-10 w-10 p-0 rounded-full shadow-lg"
        variant="default"
        size="icon"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MapPin className="h-5 w-5" />
        )}
      </Button>

      {/* Status bar removed as requested */}

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