import { useState, useEffect } from "react";
import { MapContainer } from "@/components/transport/MapContainer";
import { BusMarker } from "@/components/transport/BusMarker";
import { StopMarker } from "@/components/transport/StopMarker";
import { RoutePolyline } from "@/components/transport/RoutePolyline";
import { parseKMLFile, type ParsedRoute } from "@/utils/kmlParser";

export const MapView = () => {
  const [routeData, setRouteData] = useState<ParsedRoute | null>(null);
  const [busPosition, setBusPosition] = useState({ lat: 32.5, lng: -117 });
  const [selectedStop, setSelectedStop] = useState<ParsedRoute['stops'][0] | null>(null);
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

  // Simulate bus movement along real route
  useEffect(() => {
    if (!routeData?.points.length) return;
    
    const interval = setInterval(() => {
      setCurrentRouteIndex(prev => {
        const nextIndex = (prev + 1) % routeData.points.length;
        setBusPosition(routeData.points[nextIndex]);
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [routeData]);

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

  const nextStop = routeData.stops.find((_, index) => index === Math.floor(currentRouteIndex / (routeData.points.length / routeData.stops.length)));

  return (
    <div className="relative h-full">
      <MapContainer>
        {/* Línea de la ruta */}
        <RoutePolyline points={routeData.points} />
        
        {/* Paradas */}
        {routeData.stops.map((stop) => (
          <StopMarker
            key={stop.id}
            stop={stop}
            isSelected={selectedStop?.id === stop.id}
            onClick={() => setSelectedStop(selectedStop?.id === stop.id ? null : stop)}
          />
        ))}
        
        {/* Autobús en movimiento */}
        <BusMarker position={busPosition} />
      </MapContainer>

      {/* Status bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-card-soft px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-sm">Unidad en servicio</p>
              <p className="text-xs text-muted-foreground">
                Próxima parada: {nextStop?.name || 'Calculando...'}
              </p>
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
              <button
                onClick={() => setSelectedStop(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
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