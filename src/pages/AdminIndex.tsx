import { useState, useEffect } from 'react'
import { RouteManager } from '@/components/admin/RouteManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Route, ArrowLeft, AlertTriangle, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { updateRuta22WithKMLData } from '@/utils/updateRuta22'
import { toast } from 'sonner'

const AdminIndex = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'routes'>('overview')
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [isUpdatingRuta22, setIsUpdatingRuta22] = useState(false)

  useEffect(() => {
    // Always connected since we're using the integrated Supabase client
    setIsSupabaseConnected(true)
  }, [])

  const handleUpdateRuta22 = async () => {
    console.log("🔄 Starting Ruta 22 update process...")
    setIsUpdatingRuta22(true)
    try {
      toast.info("Actualizando Ruta 22 con datos del KML...")
      console.log("📞 Calling updateRuta22WithKMLData...")
      await updateRuta22WithKMLData()
      console.log("✅ Update completed successfully!")
      toast.success("¡Ruta 22 actualizada exitosamente!")
    } catch (error) {
      console.error("❌ Error updating Ruta 22:", error)
      toast.error("Error al actualizar la Ruta 22")
    } finally {
      console.log("🏁 Update process finished, resetting state...")
      setIsUpdatingRuta22(false)
    }
  }

  if (activeSection === 'routes') {
    return (
      <div>
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => setActiveSection('overview')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </div>
        </div>
        <RouteManager />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">Gestiona rutas, paradas y configuración del sistema</p>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Supabase Connection Alert */}
        {!isSupabaseConnected && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para usar las funciones de administración, necesitas conectar tu proyecto a Supabase. 
              <br />
              Haz clic en el botón verde "Supabase" en la parte superior derecha de la interfaz para conectar.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Routes Management */}
          <Card className={`cursor-pointer hover:shadow-md transition-shadow ${!isSupabaseConnected ? 'opacity-50' : ''}`} 
                onClick={() => isSupabaseConnected && setActiveSection('routes')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestión de Rutas</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rutas</div>
              <p className="text-xs text-muted-foreground">
                {isSupabaseConnected ? 'Crear, editar y gestionar rutas de autobús' : 'Requiere conexión a Supabase'}
              </p>
              <div className="flex gap-2 mt-4">
                <Badge variant="secondary">Crear</Badge>
                <Badge variant="secondary">Editar</Badge>
                <Badge variant="secondary">KML</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Total de rutas en funcionamiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paradas Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Paradas registradas en el sistema
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={() => setActiveSection('routes')}
                  disabled={!isSupabaseConnected}
                >
                  <Route className="h-4 w-4 mr-2" />
                  Gestionar Rutas
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleUpdateRuta22}
                  disabled={!isSupabaseConnected || isUpdatingRuta22}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUpdatingRuta22 ? "Actualizando..." : "Actualizar Ruta 22"}
                </Button>
                <Button variant="outline" disabled>
                  Exportar Datos
                </Button>
                <Button variant="outline" disabled>
                  Ver Reportes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Overview */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Características del Sistema</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestión de Rutas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Crear y editar rutas interactivamente</li>
                  <li>• Importar/exportar datos KML</li>
                  <li>• Gestión visual con mapas de Google</li>
                  <li>• Configuración de paradas y horarios</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integración de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Base de datos Supabase</li>
                  <li>• API REST para operaciones CRUD</li>
                  <li>• Seguridad con Row Level Security</li>
                  <li>• Sincronización en tiempo real</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminIndex