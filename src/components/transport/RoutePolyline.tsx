interface RoutePoint {
  lat: number;
  lng: number;
}

interface RoutePolylineProps {
  points: RoutePoint[];
}

export const RoutePolyline = ({ points }: RoutePolylineProps) => {
  // Convert lat/lng points to SVG path for Tijuana coordinates
  const pathData = points.map((point, index) => {
    // Normalize coordinates for Tijuana area (lng: ~-117, lat: ~32.5)
    const normalizedX = (point.lng + 117) * 4000;
    const normalizedY = (33 - point.lat) * 6000;
    
    const clampedX = Math.max(30, Math.min(370, normalizedX % 400));
    const clampedY = Math.max(30, Math.min(570, normalizedY % 600));
    
    return `${index === 0 ? 'M' : 'L'} ${clampedX} ${clampedY}`;
  }).join(' ');

  return (
    <svg className="absolute inset-0 w-full h-full z-5" viewBox="0 0 400 600">
      {/* Route shadow */}
      <path
        d={pathData}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(2,2)"
      />
      
      {/* Main route line */}
      <path
        d={pathData}
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
      
      {/* Route highlight */}
      <path
        d={pathData}
        stroke="hsl(var(--primary-glow))"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
};