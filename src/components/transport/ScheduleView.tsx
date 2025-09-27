import { Clock, MapPin, ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type CompleteRoute } from "@/services/routeService";

interface ScheduleViewProps {
  currentRoute?: CompleteRoute | null;
}

export const ScheduleView = ({ currentRoute }: ScheduleViewProps) => {
  if (!currentRoute) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay ruta seleccionada</p>
        </div>
      </div>
    );
  }

  // Generate mock schedule data based on route stops
  const schedules = currentRoute.stops.map((stop, index) => {
    const baseTime = new Date();
    baseTime.setHours(5, 20 + (index * 10), 0, 0); // Start at 5:20 AM, add 10 min per stop
    
    return {
      time: baseTime.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      stop: stop.name,
      status: index < 3 ? "completed" : index === 3 ? "current" : "upcoming"
    };
  });

  const nextDepartures = [
    { time: "08:00", destination: currentRoute.name, vehicle: "Unidad 101" },
    { time: "08:30", destination: currentRoute.name, vehicle: "Unidad 102" },
    { time: "09:00", destination: currentRoute.name, vehicle: "Unidad 103" },
    { time: "09:30", destination: currentRoute.name, vehicle: "Unidad 104" },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-map">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Route Header */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Calendar className="h-5 w-5" />
              <span>{currentRoute.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{currentRoute.description}</p>
          </CardContent>
        </Card>

        {/* Current Route Progress */}
        <Card className="p-4 shadow-card-soft border-primary/20">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Recorrido Actual</h2>
          </div>
          
          <div className="space-y-3">
            {schedules.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    item.status === 'completed' 
                      ? 'bg-primary border-primary' 
                      : item.status === 'current'
                      ? 'bg-secondary border-secondary animate-pulse'
                      : 'bg-transparent border-muted-foreground/30'
                  }`} />
                  {index < schedules.length - 1 && (
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