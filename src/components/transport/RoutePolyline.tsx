interface RoutePoint {
  lat: number;
  lng: number;
}

interface RoutePolylineProps {
  points: RoutePoint[];
}

export const RoutePolyline = ({ points }: RoutePolylineProps) => {
  // Convert lat/lng points to SVG path
  const pathData = points.map((point, index) => {
    const x = ((point.lng + 58.3816) * 10000 % 400);
    const y = ((point.lat + 34.6037) * 10000 % 600);
    
    const clampedX = Math.max(30, Math.min(370, x));
    const clampedY = Math.max(30, Math.min(570, y));
    
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