import { Bus } from "lucide-react";

interface BusMarkerProps {
  position: { lat: number; lng: number };
}

export const BusMarker = ({ position }: BusMarkerProps) => {
  // Convert lat/lng to pixel position for Tijuana coordinates
  const normalizedX = (position.lng + 117) * 4000;
  const normalizedY = (33 - position.lat) * 6000;
  const x = Math.max(30, Math.min(370, normalizedX % 400));
  const y = Math.max(30, Math.min(570, normalizedY % 600));

  return (
    <div
      className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-bounce-bus"
      style={{
        left: `${Math.max(30, Math.min(370, x))}px`,
        top: `${Math.max(30, Math.min(570, y))}px`,
      }}
    >
      <div className="relative">
        {/* Bus shadow */}
        <div className="absolute inset-0 bg-black/20 rounded-full blur-sm transform translate-y-1"></div>
        
        {/* Bus icon */}
        <div className="relative w-12 h-12 bg-secondary rounded-xl shadow-transport flex items-center justify-center border-2 border-white">
          <Bus size={20} className="text-white" />
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-secondary rounded-xl animate-ping opacity-20"></div>
        
        {/* Route number */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
          22
        </div>
      </div>
    </div>
  );
};