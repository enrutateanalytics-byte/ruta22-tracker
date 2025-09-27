import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  eta: string;
}

interface StopMarkerProps {
  stop: Stop;
  isSelected: boolean;
  onClick: () => void;
}

export const StopMarker = ({ stop, isSelected, onClick }: StopMarkerProps) => {
  // Convert lat/lng to pixel position for Tijuana coordinates
  const normalizedX = (stop.lng + 117) * 4000;
  const normalizedY = (33 - stop.lat) * 6000;
  const x = Math.max(20, Math.min(380, normalizedX % 400));
  const y = Math.max(40, Math.min(560, normalizedY % 600));

  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute z-15 transform -translate-x-1/2 -translate-y-full transition-all duration-200 hover:scale-110",
        isSelected && "scale-110"
      )}
      style={{
        left: `${Math.max(20, Math.min(380, x))}px`,
        top: `${Math.max(40, Math.min(560, y))}px`,
      }}
    >
      <div className="relative">
        {/* Stop marker */}
        <div className={cn(
          "w-8 h-8 rounded-full shadow-card-soft flex items-center justify-center border-2 border-white transition-colors",
          isSelected ? "bg-primary" : "bg-transport-stop"
        )}>
          <MapPin size={16} className="text-white" />
        </div>
        
        {/* Stop label */}
        <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2">
          <div className={cn(
            "px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200",
            isSelected 
              ? "bg-primary text-white shadow-transport" 
              : "bg-white/90 text-transport-stop border border-transport-stop/20"
          )}>
            {stop.name}
          </div>
        </div>
        
        {/* Selection ring */}
        {isSelected && (
          <div className="absolute inset-0 w-8 h-8 border-2 border-primary rounded-full animate-pulse"></div>
        )}
      </div>
    </button>
  );
};