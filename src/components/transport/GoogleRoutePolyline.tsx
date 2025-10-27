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
    console.log(`[GoogleRoutePolyline] Attempting to draw route with ${points.length} points, color: ${color}`);
    
    if (points.length === 0) {
      console.warn('[GoogleRoutePolyline] No points provided');
      return;
    }

    // Wait for Google Maps to be ready
    const initPolyline = () => {
      const mapElement = document.querySelector('[data-map]') as any;
      
      if (!mapElement) {
        console.warn('[GoogleRoutePolyline] Map element not found');
        return;
      }
      
      if (!mapElement.mapInstance) {
        console.warn('[GoogleRoutePolyline] Map instance not ready');
        return;
      }
      
      if (!(window as any).google) {
        console.warn('[GoogleRoutePolyline] Google Maps API not loaded');
        return;
      }

      const map = mapElement.mapInstance;
      console.log('[GoogleRoutePolyline] Creating polyline on map');

      // Create the polyline
      const routePath = new (window as any).google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 5,
      });

      // Set the polyline on the map
      routePath.setMap(map);
      console.log('[GoogleRoutePolyline] Polyline successfully added to map');

      // Store reference for cleanup
      return routePath;
    };

    // Try to initialize immediately
    const polyline = initPolyline();
    
    // If failed, retry after a short delay
    if (!polyline) {
      console.log('[GoogleRoutePolyline] Retrying in 500ms...');
      const timeout = setTimeout(() => {
        const retryPolyline = initPolyline();
        if (retryPolyline) {
          // Store for cleanup
          (window as any).__currentPolyline = retryPolyline;
        }
      }, 500);

      return () => clearTimeout(timeout);
    }

    // Cleanup function
    return () => {
      console.log('[GoogleRoutePolyline] Cleaning up polyline');
      if (polyline) {
        polyline.setMap(null);
      }
      if ((window as any).__currentPolyline) {
        (window as any).__currentPolyline.setMap(null);
        delete (window as any).__currentPolyline;
      }
    };
  }, [points, color]);

  return null; // This component doesn't render anything directly
};
