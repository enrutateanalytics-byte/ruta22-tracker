import { useState, useEffect } from "react";
import { MapContainer } from "@/components/transport/MapContainer";
import { BusMarker } from "@/components/transport/BusMarker";
import { StopMarker } from "@/components/transport/StopMarker";
import { RoutePolyline } from "@/components/transport/RoutePolyline";

// Datos simulados de la ruta
const routePoints = [
  { lat: -34.6037, lng: -58.3816 },
  { lat: -34.6047, lng: -58.3826 },
  { lat: -34.6057, lng: -58.3836 },
  { lat: -34.6067, lng: -58.3846 },
  { lat: -34.6077, lng: -58.3856 },
  { lat: -34.6087, lng: -58.3866 },
];

const busStops = [
  { id: 1, name: "Plaza Central", lat: -34.6037, lng: -58.3816, eta: "2 min" },
  { id: 2, name: "Av. Principal", lat: -34.6047, lng: -58.3826, eta: "5 min" },
  { id: 3, name: "Hospital", lat: -34.6057, lng: -58.3836, eta: "8 min" },
  { id: 4, name: "Universidad", lat: -34.6067, lng: -58.3846, eta: "12 min" },
  { id: 5, name: "Terminal Norte", lat: -34.6087, lng: -58.3866, eta: "18 min" },
];

export const MapView = () => {
  const [busPosition, setBusPosition] = useState({ lat: -34.6037, lng: -58.3816 });
  const [selectedStop, setSelectedStop] = useState<typeof busStops[0] | null>(null);

  // Simular movimiento del autobús
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % routePoints.length;
      setBusPosition(routePoints[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full">
      <MapContainer>
        {/* Línea de la ruta */}
        <RoutePolyline points={routePoints} />
        
        {/* Paradas */}
        {busStops.map((stop) => (
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
              <p className="text-xs text-muted-foreground">Próxima parada: {busStops[1].name}</p>
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