import { useEffect, useState } from "react";
import { Bus } from "lucide-react";

interface GoogleBusMarkerProps {
  position: { lat: number; lng: number };
  velocity?: number;
  orientation?: number;
  unitId?: string;
}

// Bus icon SVG path for Google Maps marker
const BUS_ICON_SVG = `
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="m8 6 4-4 4 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM13.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="white"/>
  <path d="M8 8h8l-1 13H9L8 8ZM7 8h10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="6" y="8" width="12" height="13" rx="1" fill="hsl(15 98% 16%)" stroke="white" stroke-width="2"/>
  <circle cx="9" cy="18" r="1" fill="white"/>
  <circle cx="15" cy="18" r="1" fill="white"/>
  <rect x="7" y="10" width="10" height="6" rx="1" fill="hsl(44 95% 81%)" stroke="none"/>
</svg>
`;

export const GoogleBusMarker = ({ position, velocity = 0, orientation = 0, unitId }: GoogleBusMarkerProps) => {
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    // Find the Google Map instance
    const mapElement = document.querySelector('[data-map]') as any;  
    if (!mapElement?.mapInstance || !(window as any).google) return;

    const map = mapElement.mapInstance;

    // Create custom bus icon using SVG data URL
    const scale = velocity > 0 ? 1.2 + Math.min(velocity / 50, 0.8) : 1.2;
    const busIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(BUS_ICON_SVG)}`,
      scaledSize: new (window as any).google.maps.Size(32 * scale, 32 * scale),
      anchor: new (window as any).google.maps.Point(16 * scale, 16 * scale),
      rotation: orientation,
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
      const scale = velocity > 0 ? 1.2 + Math.min(velocity / 50, 0.8) : 1.2;
      const updatedIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(BUS_ICON_SVG)}`,
        scaledSize: new (window as any).google.maps.Size(32 * scale, 32 * scale),
        anchor: new (window as any).google.maps.Point(16 * scale, 16 * scale),
        rotation: orientation,
      };
      marker.setIcon(updatedIcon);
    }
  }, [position, marker, velocity, orientation]);

  return null; // This component doesn't render anything directly
};
