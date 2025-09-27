import { ReactNode } from "react";

interface MapContainerProps {
  children: ReactNode;
}

export const MapContainer = ({ children }: MapContainerProps) => {
  return (
    <div className="relative w-full h-full bg-gradient-map overflow-hidden">
      {/* Simulated map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        {/* Grid pattern to simulate map */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Simulated streets */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
          {/* Main avenue */}
          <path
            d="M 50 50 Q 100 150 150 250 Q 200 350 250 450 Q 300 550 350 600"
            stroke="hsl(var(--transport-route-active))"
            strokeWidth="4"
            fill="none"
            className="drop-shadow-sm"
          />
          
          {/* Side streets */}
          <line x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="0" y1="240" x2="400" y2="240" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="0" y1="360" x2="400" y2="360" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="0" y1="480" x2="400" y2="480" stroke="#e5e7eb" strokeWidth="2" />
          
          {/* Vertical streets */}
          <line x1="100" y1="0" x2="100" y2="600" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="200" y1="0" x2="200" y2="600" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="300" y1="0" x2="300" y2="600" stroke="#e5e7eb" strokeWidth="2" />
        </svg>
      </div>
      
      {/* Map content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
      
      {/* Zoom controls */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col space-y-2">
        <button className="w-10 h-10 bg-white rounded-md shadow-card-soft flex items-center justify-center text-lg font-semibold text-muted-foreground hover:text-primary">
          +
        </button>
        <button className="w-10 h-10 bg-white rounded-md shadow-card-soft flex items-center justify-center text-lg font-semibold text-muted-foreground hover:text-primary">
          −
        </button>
      </div>
    </div>
  );
};