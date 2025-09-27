import { ReactNode, useState, useRef, useEffect } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Card, CardContent } from "@/components/ui/card";

interface GoogleMapContainerProps {
  children: ReactNode;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapComponent = ({ 
  children, 
  center = { lat: 32.4427, lng: -116.9883 }, // Tijuana center
  zoom = 13 
}: GoogleMapContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>();

  useEffect(() => {
    if (ref.current && !map && (window as any).google) {
      const newMap = new (window as any).google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: 'hsl(158 64% 52%)' }, { weight: 3 }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: 'hsl(199 89% 48%)' }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });
      
      // Store map reference on the DOM element for access by markers
      (ref.current as any).mapInstance = newMap;
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  return (
    <div className="relative w-full h-full">
      <div ref={ref} className="w-full h-full rounded-lg" data-map />
      {map && (
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};


// Google Maps API Key integrated directly
const GOOGLE_MAPS_API_KEY = "AIzaSyDDX6lGRrJooUvhTY11EOuOT9n28E1lt4k";

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full bg-gradient-map">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Cargando Google Maps...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full bg-gradient-map">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-destructive font-medium">Error al cargar Google Maps</p>
              <p className="text-sm text-muted-foreground">
                Verifica que tu API key sea válida y tenga permisos para Maps JavaScript API
              </p>
            </CardContent>
          </Card>
        </div>
      );
    default:
      return null;
  }
};

export const GoogleMapContainer = ({ children, center, zoom }: GoogleMapContainerProps) => {
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render}>
      <MapComponent center={center} zoom={zoom}>
        {children}
      </MapComponent>
    </Wrapper>
  );
};