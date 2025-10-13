import { useEffect, useState } from "react";

interface GoogleUserLocationMarkerProps {
  position: {
    lat: number;
    lng: number;
  };
  accuracy: number;
}

export const GoogleUserLocationMarker = ({ position, accuracy }: GoogleUserLocationMarkerProps) => {
  const [marker, setMarker] = useState<any>(null);
  const [circle, setCircle] = useState<any>(null);

  useEffect(() => {
    // Find the Google Map instance
    const mapElement = document.querySelector('[data-map]') as any;
    if (!mapElement?.mapInstance || !(window as any).google) return;

    const map = mapElement.mapInstance;

    // Create accuracy circle
    const accuracyCircle = new (window as any).google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map: map,
      center: position,
      radius: accuracy,
    });

    // Create user location marker (blue dot)
    const userMarker = new (window as any).google.maps.Marker({
      position: position,
      map: map,
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 10,
      },
      zIndex: 1000,
    });

    setMarker(userMarker);
    setCircle(accuracyCircle);

    // Cleanup function
    return () => {
      userMarker.setMap(null);
      accuracyCircle.setMap(null);
    };
  }, []);

  // Update position when it changes
  useEffect(() => {
    if (!marker || !circle || !(window as any).google) return;

    marker.setPosition(position);
    circle.setCenter(position);
    circle.setRadius(accuracy);
  }, [position, accuracy, marker, circle]);

  return null;
};