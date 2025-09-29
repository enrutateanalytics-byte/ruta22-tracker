import { useEffect, useState } from "react";
import busIcon from "@/assets/icono_autobus.png";

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

    // Create custom bus icon using the uploaded icon
    const scale = velocity > 0 ? 0.8 + Math.min(velocity / 100, 0.4) : 0.8;
    const busIconConfig = {
      url: busIcon,
      scaledSize: new (window as any).google.maps.Size(20 * scale, 20 * scale),
      anchor: new (window as any).google.maps.Point(10 * scale, 10 * scale),
    };

    // Create info window content
    const infoContent = `
      <div style="padding: 12px; font-family: Arial, sans-serif; min-width: 200px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="color: hsl(15 98% 16%); font-weight: bold; font-size: 16px;">
            ${unitId ? `Unidad ${unitId}` : 'M1 R18 - Autobús'}
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span style="font-size: 13px; color: #666;">Velocidad:</span>
          <span style="font-size: 13px; font-weight: bold; color: hsl(15 98% 16%);">${Math.round(velocity)} km/h</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span style="font-size: 13px; color: #666;">Orientación:</span>
          <span style="font-size: 13px; font-weight: bold; color: hsl(15 98% 16%);">${Math.round(orientation)}°</span>
        </div>
        ${velocity > 0 ? '<div style="margin-top: 8px; padding: 4px 8px; background: hsl(44 95% 81%); border-radius: 4px; font-size: 11px; color: hsl(15 98% 16%); text-align: center;">🚌 En movimiento</div>' : '<div style="margin-top: 8px; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px; color: #666; text-align: center;">🛑 Detenido</div>'}
      </div>
    `;

    // Create the marker
    const newMarker = new (window as any).google.maps.Marker({
      position: position,
      map: map,
      title: unitId ? `Unidad ${unitId}` : "M1 R18 - Autobús",
      icon: busIconConfig,
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
      const scale = velocity > 0 ? 0.8 + Math.min(velocity / 100, 0.4) : 0.8;
      const updatedIcon = {
        url: busIcon,
        scaledSize: new (window as any).google.maps.Size(20 * scale, 20 * scale),
        anchor: new (window as any).google.maps.Point(10 * scale, 10 * scale),
      };
      marker.setIcon(updatedIcon);
    }
  }, [position, marker, velocity, orientation]);

  return null; // This component doesn't render anything directly
};
