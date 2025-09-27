import { useEffect, useState } from "react";

interface Stop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  eta: string;
}

interface GoogleStopMarkerProps {
  stop: Stop;
  isSelected: boolean;
  onClick: () => void;
}

export const GoogleStopMarker = ({ stop, isSelected, onClick }: GoogleStopMarkerProps) => {
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    // Find the Google Map instance
    const mapElement = document.querySelector('[data-map]') as any;
    if (!mapElement?.mapInstance || !(window as any).google) return;

    const map = mapElement.mapInstance;

    // Create custom marker icon
    const markerIcon = {
      path: (window as any).google.maps.SymbolPath.CIRCLE,
      fillColor: isSelected ? 'hsl(158 64% 52%)' : 'hsl(158 100% 30%)',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8,
    };

    // Create the marker
    const newMarker = new (window as any).google.maps.Marker({
      position: { lat: stop.lat, lng: stop.lng },
      map: map,
      title: stop.name,
      icon: markerIcon,
      clickable: true,
    });

    // Add click listener
    newMarker.addListener('click', onClick);

    setMarker(newMarker);

    // Cleanup function
    return () => {
      newMarker.setMap(null);
    };
  }, [stop, onClick]); // Removed isSelected from deps to handle it separately

  // Update marker appearance when selection changes
  useEffect(() => {
    if (!marker || !(window as any).google) return;

    const markerIcon = {
      path: (window as any).google.maps.SymbolPath.CIRCLE,
      fillColor: isSelected ? 'hsl(158 64% 52%)' : 'hsl(158 100% 30%)',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: isSelected ? 10 : 8,
    };

    marker.setIcon(markerIcon);
  }, [isSelected, marker]);

  return null; // This component doesn't render anything directly
};
