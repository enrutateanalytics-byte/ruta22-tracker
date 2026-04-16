import { useEffect, useState, useRef, useCallback } from "react";
import busIconSrc from "@/assets/autobus_circular.png";

interface GoogleBusMarkerProps {
  position: { lat: number; lng: number };
  velocity?: number;
  orientation?: number;
  unitId?: string;
  economicNumber?: string;
}

/**
 * Creates a rotated version of the bus icon using an offscreen canvas.
 * Returns a data URL that can be used as the marker icon.
 */
function createRotatedIcon(
  img: HTMLImageElement,
  angleDeg: number,
  size: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  return canvas.toDataURL("image/png");
}

export const GoogleBusMarker = ({ position, velocity = 0, orientation = 0, unitId, economicNumber }: GoogleBusMarkerProps) => {
  const [marker, setMarker] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Preload bus icon image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = busIconSrc;
  }, []);

  const getIconConfig = useCallback((vel: number, orient: number) => {
    const pixelSize = 33;

    if (imgRef.current) {
      const rotatedUrl = createRotatedIcon(imgRef.current, orient, pixelSize);
      return {
        url: rotatedUrl,
        scaledSize: new (window as any).google.maps.Size(pixelSize, pixelSize),
        anchor: new (window as any).google.maps.Point(pixelSize / 2, pixelSize / 2),
      };
    }
    // Fallback without rotation
    return {
      url: busIconSrc,
      scaledSize: new (window as any).google.maps.Size(pixelSize, pixelSize),
      anchor: new (window as any).google.maps.Point(pixelSize / 2, pixelSize / 2),
    };
  }, []);

  useEffect(() => {
    // Find the Google Map instance
    const mapElement = document.querySelector('[data-map]') as any;  
    if (!mapElement?.mapInstance || !(window as any).google || !imgLoaded) return;

    const map = mapElement.mapInstance;

    const busIconConfig = getIconConfig(velocity, orientation);

    // Create info window content
    const infoContent = `
      <div style="padding: 12px; font-family: Arial, sans-serif; min-width: 220px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="color: hsl(15 98% 16%); font-weight: bold; font-size: 16px;">
            ${economicNumber ? `Unidad #${economicNumber}` : (unitId ? `Unidad ${unitId}` : 'M1 R18 - Autobús')}
          </div>
        </div>
        ${unitId ? `
        <div style="display: flex; justify-content: space-between; margin: 4px 0; padding-bottom: 6px; border-bottom: 1px solid #eee;">
          <span style="font-size: 12px; color: #999;">IMEI:</span>
          <span style="font-size: 12px; font-weight: 500; color: #666;">${unitId}</span>
        </div>
        ` : ''}
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
      title: economicNumber ? `Unidad #${economicNumber}` : (unitId ? `Unidad ${unitId}` : "M1 R18 - Autobús"),
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
  }, [imgLoaded]); // Re-create when image loads

  // Update marker position, icon rotation when props change
  useEffect(() => {
    if (!marker || !imgLoaded) return;
    
    marker.setPosition(position);
    marker.setIcon(getIconConfig(velocity, orientation));
  }, [position, marker, velocity, orientation, imgLoaded, getIconConfig]);

  return null;
};
