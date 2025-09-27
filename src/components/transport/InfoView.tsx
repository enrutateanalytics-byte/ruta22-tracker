import { Phone, Mail, MapPin, Clock, Info as InfoIcon, Users, Bus, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type CompleteRoute } from "@/services/routeService";

interface InfoViewProps {
  currentRoute?: CompleteRoute | null;
}

export const InfoView = ({ currentRoute }: InfoViewProps) => {
  if (!currentRoute) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay ruta seleccionada</p>
        </div>
      </div>
    );
  }

  const getBadgeText = (routeName: string) => {
    if (routeName.includes('M1')) return 'M1';
    if (routeName.includes('Centro')) return 'CP';
    if (routeName.includes('Azul')) return 'LA';
    if (routeName.includes('Universidad')) return 'RU';
    if (routeName.includes('Roja')) return 'LR';
    return 'R';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-map">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Route Header */}
        <Card className="p-6 shadow-card-soft text-white" style={{ backgroundColor: currentRoute.color }}>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: currentRoute.color }}>
                {getBadgeText(currentRoute.name)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{currentRoute.name}</h1>
              <p className="opacity-90">Servicio de Transporte Urbano</p>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4 mt-4">
            <p className="text-sm leading-relaxed">
              {currentRoute.description || 'Servicio de transporte público conectando puntos importantes de la ciudad.'}
            </p>
          </div>
        </Card>

        {/* Route Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Navigation className="h-5 w-5" />
              <span>Información de Ruta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ruta</p>
                <p className="font-semibold">{currentRoute.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="font-semibold">{currentRoute.description || 'Sin descripción'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className={`font-semibold ${currentRoute.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {currentRoute.is_active ? 'Activa' : 'Inactiva'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paradas</p>
                <p className="font-semibold">{currentRoute.stops.length} paradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Details */}
        <Card className="p-4 shadow-card-soft">
          <div className="flex items-center space-x-2 mb-4">
            <InfoIcon size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-primary">Detalles del Recorrido</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin size={16} className="text-secondary mt-1" />
              <div>
                <p className="font-medium">Recorrido Completo</p>
                <p className="text-sm text-muted-foreground">
                  {currentRoute.stops.length > 0 ? 
                    `${currentRoute.stops[0].name} ↔ ${currentRoute.stops[currentRoute.stops.length - 1].name}` :
                    'Información no disponible'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentRoute.points.length} puntos GPS • {currentRoute.stops.length} paradas • 45 min aproximadamente
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock size={16} className="text-secondary mt-1" />
              <div>
                <p className="font-medium">Frecuencia</p>
                <p className="text-sm text-muted-foreground">
                  Cada 30 minutos en hora pico
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cada 45 minutos en hora valle
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users size={16} className="text-secondary mt-1" />
              <div>
                <p className="font-medium">Capacidad</p>
                <p className="text-sm text-muted-foreground">
                  40 pasajeros sentados • 80 de pie
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-4 shadow-card-soft">
          <h2 className="text-lg font-semibold text-secondary mb-4">Contacto y Soporte</h2>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Phone size={18} className="mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">+52 664 123-4567</p>
                <p className="text-xs text-muted-foreground">Línea de atención TEBSA</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Mail size={18} className="mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">info@tebsa.mx</p>
                <p className="text-xs text-muted-foreground">Consultas y sugerencias</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* Service Features */}
        <Card className="p-4 shadow-card-soft border-primary/20">
          <h2 className="text-lg font-semibold text-primary mb-4">Servicios Disponibles</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">📶</span>
              </div>
              <p className="text-xs font-medium">WiFi Gratis</p>
            </div>
            
            <div className="text-center p-3 bg-secondary/10 rounded-lg">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">♿</span>
              </div>
              <p className="text-xs font-medium">Accesible</p>
            </div>
            
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">❄️</span>
              </div>
              <p className="text-xs font-medium">Aire Acond.</p>
            </div>
            
            <div className="text-center p-3 bg-secondary/10 rounded-lg">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">📱</span>
              </div>
              <p className="text-xs font-medium">Pago Digital</p>
            </div>
          </div>
        </Card>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            TEBSA App v1.0.0 • Desarrollado con ❤️ en Tijuana
          </p>
        </div>
      </div>
    </div>
  );
};