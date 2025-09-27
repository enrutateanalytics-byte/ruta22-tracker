import { useEffect, useState } from "react";

interface GoogleBusMarkerProps {
  position: { lat: number; lng: number };
  velocity?: number;
  orientation?: number;
  unitId?: string;
}

export const GoogleBusMarker = ({ position, velocity = 0, orientation = 0, unitId }: GoogleBusMarkerProps) => {
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    // Find the Google Map instance
    const mapElement = document.querySelector('[data-map]') as any;  
    if (!mapElement?.mapInstance || !(window as any).google) return;

    const map = mapElement.mapInstance;

    // Create custom bus icon with orientation
    const busIcon = {
      path: (window as any).google.maps.SymbolPath.CIRCLE,
      fillColor: 'hsl(199 89% 48%)', // Secondary color
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: velocity > 0 ? 12 + Math.min(velocity / 10, 6) : 12, // Scale based on velocity
      rotation: orientation, // Rotate based on bus orientation
    };

    // Create info window content
    const infoContent = `
      <div style="padding: 8px; font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: hsl(199 89% 48%);">
          ${unitId ? `Unidad ${unitId}` : 'M1 R18 - Autobús'}
        </h4>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Velocidad:</strong> ${Math.round(velocity)} km/h
        </p>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Orientación:</strong> ${Math.round(orientation)}°
        </p>
      </div>
    `;

    // Create the marker
    const newMarker = new (window as any).google.maps.Marker({
      position: position,
      map: map,
      title: unitId ? `Unidad ${unitId}` : "M1 R18 - Autobús",
      icon: busIcon,
      zIndex: 1000,
    });

    // Create info window
    const infoWindow = new (window as any).google.maps.InfoWindow({
      content: infoContent,
    });

    // Add click listener to show info window
    newMarker.addListener('click', () => {
      infoWindow.open(map, newMarker);
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
    
    // Update icon with new velocity and orientation
    if (velocity !== undefined && orientation !== undefined) {
      const updatedIcon = {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        fillColor: 'hsl(199 89% 48%)',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: velocity > 0 ? 12 + Math.min(velocity / 10, 6) : 12,
        rotation: orientation,
      };
      marker.setIcon(updatedIcon);
    }
  }, [position, marker, velocity, orientation]);

  return null; // This component doesn't render anything directly
};
