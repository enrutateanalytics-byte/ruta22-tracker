import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Política de Privacidad
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Información que recopilamos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nuestra aplicación recopila información de ubicación en tiempo real para proporcionar
                servicios de seguimiento de transporte público. Esta información incluye:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                <li>Ubicación GPS del dispositivo (solo mientras se usa la aplicación)</li>
                <li>Datos de uso de la aplicación</li>
                <li>Información técnica del dispositivo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Uso de la información</h2>
              <p className="text-muted-foreground leading-relaxed">
                La información recopilada se utiliza exclusivamente para:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                <li>Mostrar tu ubicación en el mapa</li>
                <li>Calcular distancias a paradas de autobús</li>
                <li>Proporcionar información de rutas cercanas</li>
                <li>Mejorar la experiencia del usuario</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Compartir información</h2>
              <p className="text-muted-foreground leading-relaxed">
                No compartimos, vendemos ni alquilamos tu información personal a terceros.
                Los datos de ubicación se procesan localmente en tu dispositivo y no se almacenan
                en servidores externos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Seguridad</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de seguridad para proteger tu información. Sin embargo,
                ningún método de transmisión por Internet o almacenamiento electrónico es
                100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Permisos de ubicación</h2>
              <p className="text-muted-foreground leading-relaxed">
                La aplicación solicita permisos de ubicación únicamente para mostrar tu posición
                en el mapa. Puedes revocar estos permisos en cualquier momento desde la
                configuración de tu dispositivo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cambios a esta política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos reservamos el derecho de actualizar esta política de privacidad en cualquier
                momento. Te notificaremos sobre cambios significativos mediante la aplicación
                o por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos a
                través de los canales oficiales de TEBSA.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
