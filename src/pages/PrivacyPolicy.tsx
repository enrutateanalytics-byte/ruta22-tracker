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
              Aviso de Privacidad – Ruta 22
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: Octubre 2025
            </p>
          </div>

          <div className="space-y-4 text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              La aplicación Ruta 22 (en adelante "la App") es una herramienta informativa cuyo objetivo es brindar a los usuarios información sobre el recorrido, paradas y ubicación en tiempo real de las unidades de transporte público correspondientes a la Ruta 22.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La protección de sus datos personales es muy importante para nosotros, por lo que este Aviso de Privacidad tiene como finalidad informarle sobre el uso, tratamiento y protección de la información que recopilamos a través de la App.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. Responsable del tratamiento de los datos personales</h2>
              <p className="text-muted-foreground leading-relaxed">
                El responsable del tratamiento de sus datos personales es Ruta 22, quien garantiza la confidencialidad y seguridad de la información proporcionada a través de la App.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Puede contactarnos al correo electrónico: <span className="font-medium text-foreground">contacto@ruta22.app</span>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. Datos personales que se recaban</h2>
              <p className="text-muted-foreground leading-relaxed">
                La App no solicita ni almacena información personal sensible de los usuarios.
                Sin embargo, con el fin de mejorar la experiencia y funcionalidad del servicio, puede recopilar la siguiente información:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Datos de ubicación (geolocalización), únicamente si el usuario otorga su consentimiento.</li>
                <li>Información técnica del dispositivo (versión del sistema operativo, modelo del teléfono, idioma y zona horaria).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. Finalidad del tratamiento de la información</h2>
              <p className="text-muted-foreground leading-relaxed">
                Los datos recabados son utilizados exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Mostrar en el mapa la ubicación del usuario y de las unidades en tiempo real.</li>
                <li>Optimizar el funcionamiento de la App y mejorar su desempeño.</li>
                <li>Analizar de forma anónima el uso de la aplicación para fines estadísticos y de mejora del servicio.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                En ningún caso los datos son utilizados con fines comerciales, publicitarios o distintos a los mencionados.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Transferencia de datos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ruta 22 no comparte, vende ni transfiere información personal a terceros.
                Solo podrá compartir información técnica o anónima cuando sea necesario para el funcionamiento de la App (por ejemplo, con proveedores de servicios de mapas o servidores), quienes están obligados a cumplir con las políticas de privacidad correspondientes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Derechos del usuario (ARCO)</h2>
              <p className="text-muted-foreground leading-relaxed">
                El usuario tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales.
                Para ejercer estos derechos puede enviar una solicitud al correo: <span className="font-medium text-foreground">contacto@ruta22.app</span>, indicando su nombre y la descripción del derecho que desea ejercer.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. Uso de cookies y tecnologías similares</h2>
              <p className="text-muted-foreground leading-relaxed">
                La App puede utilizar herramientas de análisis que recopilan información anónima sobre el uso de la aplicación (por ejemplo, Google Analytics for Firebase).
                Estos datos se emplean únicamente con fines estadísticos y no permiten identificar personalmente al usuario.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. Cambios al aviso de privacidad</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ruta 22 se reserva el derecho de modificar este Aviso de Privacidad en cualquier momento.
                Cualquier cambio será publicado dentro de la aplicación y en su sitio web, en caso de existir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">8. Aceptación del aviso</h2>
              <p className="text-muted-foreground leading-relaxed">
                Al usar la App, el usuario acepta los términos y condiciones establecidos en este Aviso de Privacidad.
                Si el usuario no está de acuerdo con los términos, deberá desinstalar la aplicación y dejar de utilizar el servicio.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
