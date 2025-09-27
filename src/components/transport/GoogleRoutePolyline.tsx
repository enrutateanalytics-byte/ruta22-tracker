import { useEffect } from "react";

interface RoutePoint {
  lat: number;
  lng: number;
}

interface GoogleRoutePolylineProps {
  points: RoutePoint[];
  color?: string;
}

export const GoogleRoutePolyline = ({ points, color = '#A52714' }: GoogleRoutePolylineProps) => {
  useEffect(() => {
    // Find the Google Map instance
    const mapElement = document.querySelector('[data-map]') as any;
    if (!mapElement?.mapInstance || !(window as any).google) return;

    const map = mapElement.mapInstance;

    // Create the polyline
    const routePath = new (window as any).google.maps.Polyline({
      path: points,
      geodesic: false,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });

    // Set the polyline on the map
    routePath.setMap(map);

    // Cleanup function
    return () => {
      routePath.setMap(null);
    };
  }, [points, color]);

  return null; // This component doesn't render anything directly
};
