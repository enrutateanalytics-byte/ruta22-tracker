import { useEffect, useState } from "react";

interface GoogleBusMarkerProps {
  position: { lat: number; lng: number };
}

export const GoogleBusMarker = ({ position }: GoogleBusMarkerProps) => {
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    // Find the Google Map instance
    const mapElement = document.querySelector('[data-map]') as any;  
    if (!mapElement?.mapInstance || !(window as any).google) return;

    const map = mapElement.mapInstance;

    // Create custom bus icon (using a simple colored circle for now)
    const busIcon = {
      path: (window as any).google.maps.SymbolPath.CIRCLE,
      fillColor: 'hsl(199 89% 48%)', // Secondary color
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 12,
    };

    // Create the marker
    const newMarker = new (window as any).google.maps.Marker({
      position: position,
      map: map,
      title: "M1 R18 - Autobús",
      icon: busIcon,
      zIndex: 1000,
    });

    setMarker(newMarker);

    // Cleanup function
    return () => {
      newMarker.setMap(null);
    };
  }, []); // Empty dependency array for initial creation

  // Update marker position when position changes
  useEffect(() => {
    if (!marker) return;
    
    // Smooth animation to new position
    marker.setPosition(position);
  }, [position, marker]);

  return null; // This component doesn't render anything directly
};
