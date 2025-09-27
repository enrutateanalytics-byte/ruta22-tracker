import { Phone, Mail, MapPin, Clock, Info as InfoIcon, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const InfoView = () => {
  return (
    <div className="flex flex-col h-full bg-gradient-map">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Route Header */}
        <Card className="p-6 shadow-card-soft bg-gradient-primary text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">22</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ruta 22</h1>
              <p className="opacity-90">Servicio de Transporte Urbano</p>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4 mt-4">
            <p className="text-sm leading-relaxed">
              Conecta desde el centro histórico hasta la zona norte de la ciudad, 
              pasando por los principales puntos de interés como hospitales, 
              universidades y centros comerciales.
            </p>
          </div>
        </Card>

        {/* Route Details */}
        <Card className="p-4 shadow-card-soft">
          <div className="flex items-center space-x-2 mb-4">
            <InfoIcon size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-primary">Información de la Ruta</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin size={16} className="text-secondary mt-1" />
              <div>
                <p className="font-medium">Recorrido Completo</p>
                <p className="text-sm text-muted-foreground">
                  Terminal Central ↔ Terminal Norte
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  15.2 km • 12 paradas • 45 min aproximadamente
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
                <p className="font-medium">+54 11 2345-6789</p>
                <p className="text-xs text-muted-foreground">Línea de atención al cliente</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Mail size={18} className="mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">info@ruta22.com</p>
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
            Ruta 22 App v1.0.0 • Desarrollado con ❤️
          </p>
        </div>
      </div>
    </div>
  );
};