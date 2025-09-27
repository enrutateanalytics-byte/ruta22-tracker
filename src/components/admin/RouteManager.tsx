import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Upload, Download } from 'lucide-react'
import { routeService, type CompleteRoute } from '@/services/routeService'
import { RouteEditor } from './RouteEditor'
import { useToast } from '@/hooks/use-toast'

export const RouteManager = () => {
  const [routes, setRoutes] = useState<CompleteRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<CompleteRoute | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadRoutes()
  }, [])

  const loadRoutes = async () => {
    try {
      setLoading(true)
      const routesData = await routeService.getAllRoutes()
      setRoutes(routesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedRoute(null)
    setIsEditing(true)
  }

  const handleEdit = (route: CompleteRoute) => {
    setSelectedRoute(route)
    setIsEditing(true)
  }

  const handleDelete = async (routeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta ruta?')) return

    try {
      await routeService.deleteRoute(routeId)
      toast({
        title: "Éxito",
        description: "Ruta eliminada correctamente"
      })
      loadRoutes()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la ruta",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    setIsEditing(false)
    setSelectedRoute(null)
    await loadRoutes()
    toast({
      title: "Éxito",
      description: "Ruta guardada correctamente"
    })
  }

  const handleImportKML = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      await routeService.importFromKML(content)
      toast({
        title: "Éxito",
        description: "Archivo KML importado correctamente"
      })
      loadRoutes()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo importar el archivo KML",
        variant: "destructive"
      })
    }
  }

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isEditing) {
    return (
      <RouteEditor
        route={selectedRoute}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Rutas</h1>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".kml"
              onChange={handleImportKML}
              className="hidden"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar KML
            </Button>
          </label>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Ruta
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar rutas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">{route.name}</CardTitle>
                  <Badge 
                    variant={route.is_active ? "default" : "secondary"}
                    style={{ backgroundColor: route.is_active ? route.color : undefined }}
                  >
                    {route.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {route.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {route.description}
                  </p>
                )}
                
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>{route.stops?.length || 0} paradas</span>
                  <span>{route.points?.length || 0} puntos</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(route)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(route.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredRoutes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? 'No se encontraron rutas que coincidan con la búsqueda' : 'No hay rutas disponibles'}
          </p>
        </div>
      )}
    </div>
  )
}