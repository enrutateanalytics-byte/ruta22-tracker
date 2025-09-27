import { Clock, MapPin, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const scheduleData = [
  { time: "06:00", status: "completed", stop: "Terminal Central" },
  { time: "06:15", status: "completed", stop: "Plaza Central" },
  { time: "06:30", status: "completed", stop: "Av. Principal" },
  { time: "06:45", status: "current", stop: "Hospital" },
  { time: "07:00", status: "upcoming", stop: "Universidad" },
  { time: "07:15", status: "upcoming", stop: "Terminal Norte" },
  { time: "07:30", status: "upcoming", stop: "Zona Comercial" },
  { time: "07:45", status: "upcoming", stop: "Terminal Central" },
];

const nextDepartures = [
  { time: "08:00", destination: "Terminal Norte", vehicle: "Unidad 101" },
  { time: "08:30", destination: "Terminal Norte", vehicle: "Unidad 102" },
  { time: "09:00", destination: "Terminal Norte", vehicle: "Unidad 103" },
  { time: "09:30", destination: "Terminal Norte", vehicle: "Unidad 104" },
];

export const ScheduleView = () => {
  return (
    <div className="flex flex-col h-full bg-gradient-map">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Current Route Progress */}
        <Card className="p-4 shadow-card-soft border-primary/20">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Recorrido Actual</h2>
          </div>
          
          <div className="space-y-3">
            {scheduleData.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    item.status === 'completed' 
                      ? 'bg-primary border-primary' 
                      : item.status === 'current'
                      ? 'bg-secondary border-secondary animate-pulse'
                      : 'bg-transparent border-muted-foreground/30'
                  }`} />
                  {index < scheduleData.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${
                      item.status === 'completed' ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-between py-1">
                  <div>
                    <p className={`font-medium ${
                      item.status === 'current' ? 'text-secondary' : 'text-foreground'
                    }`}>
                      {item.stop}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                  
                  {item.status === 'current' && (
                    <div className="flex items-center space-x-2 text-secondary">
                      <MapPin size={14} />
                      <span className="text-xs font-medium">Actual</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Departures */}
        <Card className="p-4 shadow-card-soft">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <ArrowRight size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-secondary">Próximas Salidas</h2>
          </div>
          
          <div className="space-y-3">
            {nextDepartures.map((departure, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{departure.time}</p>
                  <p className="text-sm text-muted-foreground">{departure.destination}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary">{departure.vehicle}</p>
                  <p className="text-xs text-muted-foreground">Disponible</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Service Hours */}
        <Card className="p-4 shadow-card-soft bg-gradient-secondary text-white">
          <h3 className="font-semibold mb-3">Horarios de Servicio</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">Lunes a Viernes</p>
              <p className="opacity-90">05:30 - 22:30</p>
            </div>
            <div>
              <p className="font-medium mb-1">Fines de Semana</p>
              <p className="opacity-90">06:00 - 22:00</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};