import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'
import { routeService, type CompleteRoute, type RouteData, type StopData, type RoutePointData } from '@/services/routeService'
import { GoogleMapContainer } from '@/components/transport/GoogleMapContainer'
import { useToast } from '@/hooks/use-toast'

interface RouteEditorProps {
  route?: CompleteRoute | null
  onSave: () => void
  onCancel: () => void
}

export const RouteEditor = ({ route, onSave, onCancel }: RouteEditorProps) => {
  const [routeData, setRouteData] = useState<RouteData>({
    name: '',
    description: '',
    color: '#10b981',
    is_active: true
  })
  const [stops, setStops] = useState<Array<StopData & { tempId?: string }>>([])
  const [points, setPoints] = useState<RoutePointData[]>([])
  const [loading, setLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 32.5149, lng: -117.0382 }) // Tijuana center
  const { toast } = useToast()

  useEffect(() => {
    if (route) {
      setRouteData({
        name: route.name,
        description: route.description || '',
        color: route.color,
        is_active: route.is_active
      })
      setStops(route.stops?.map(stop => ({
        id: stop.id,
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        estimated_time: stop.estimated_time || '5 min'
      })) || [])
      setPoints(route.points?.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude
      })) || [])
    }
  }, [route])

  const handleAddStop = () => {
    const newStop = {
      tempId: Date.now().toString(),
      name: `Parada ${stops.length + 1}`,
      latitude: mapCenter.lat,
      longitude: mapCenter.lng,
      estimated_time: '5 min'
    }
    setStops([...stops, newStop])
  }

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const handleStopChange = (index: number, field: keyof StopData, value: string | number) => {
    setStops(stops.map((stop, i) => i === index ? { ...stop, [field]: value } : stop))
  }

  const handleMapClick = (event: any) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      // Add as route point
      setPoints([...points, { latitude: lat, longitude: lng }])
    }
  }

  const handleSave = async () => {
    if (!routeData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la ruta es obligatorio",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      if (route?.id) {
        await routeService.updateRoute(route.id, routeData, stops, points)
      } else {
        await routeService.createRoute(routeData, stops, points)
      }
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la ruta",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">
            {route ? 'Editar Ruta' : 'Nueva Ruta'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Route Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Ruta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="route-name">Nombre</Label>
                <Input
                  id="route-name"
                  value={routeData.name}
                  onChange={(e) => setRouteData({ ...routeData, name: e.target.value })}
                  placeholder="Ej: M1 R18 - Apoyo Urbi 2 / Barcelona"
                />
              </div>
              
              <div>
                <Label htmlFor="route-description">Descripción</Label>
                <Textarea
                  id="route-description"
                  value={routeData.description}
                  onChange={(e) => setRouteData({ ...routeData, description: e.target.value })}
                  placeholder="Descripción opcional de la ruta"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="route-color">Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="route-color"
                    type="color"
                    value={routeData.color}
                    onChange={(e) => setRouteData({ ...routeData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={routeData.color}
                    onChange={(e) => setRouteData({ ...routeData, color: e.target.value })}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="route-active"
                  checked={routeData.is_active}
                  onCheckedChange={(checked) => setRouteData({ ...routeData, is_active: checked })}
                />
                <Label htmlFor="route-active">Ruta activa</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Paradas ({stops.length})</CardTitle>
                <Button size="sm" onClick={handleAddStop}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {stops.map((stop, index) => (
                  <div key={stop.id || stop.tempId} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStop(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={stop.name}
                      onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                      placeholder="Nombre de la parada"
                      className="mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        type="number"
                        step="any"
                        value={stop.latitude}
                        onChange={(e) => handleStopChange(index, 'latitude', parseFloat(e.target.value))}
                        placeholder="Lat"
                      />
                      <Input
                        type="number"
                        step="any"
                        value={stop.longitude}
                        onChange={(e) => handleStopChange(index, 'longitude', parseFloat(e.target.value))}
                        placeholder="Lng"
                      />
                    </div>
                    <Input
                      value={stop.estimated_time || ''}
                      onChange={(e) => handleStopChange(index, 'estimated_time', e.target.value)}
                      placeholder="Tiempo estimado"
                    />
                  </div>
                ))}
                {stops.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No hay paradas. Haz clic en "Agregar" para añadir una parada.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mapa Interactivo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Haz clic en el mapa para agregar puntos de ruta. Puntos: {points.length}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <GoogleMapContainer center={mapCenter} zoom={12}>
                  <MapClickHandler onClick={handleMapClick} />
                  {/* Render route polyline */}
                  {points.length > 0 && (
                    <RoutePolyline points={points} color={routeData.color || '#10b981'} />
                  )}
                  {/* Render stop markers */}
                  {stops.map((stop, index) => (
                    <StopMarker
                      key={stop.id || stop.tempId}
                      stop={stop}
                      sequence={index + 1}
                    />
                  ))}
                </GoogleMapContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper components for map interaction
const MapClickHandler = ({ onClick }: { onClick: (event: any) => void }) => {
  useEffect(() => {
    const mapElement = document.querySelector('[data-map]') as any
    if (!mapElement?.mapInstance || !(window as any).google) return

    const map = mapElement.mapInstance
    const listener = map.addListener('click', onClick)

    return () => {
      if ((window as any).google?.maps?.event?.removeListener) {
        (window as any).google.maps.event.removeListener(listener)
      }
    }
  }, [onClick])

  return null
}

const RoutePolyline = ({ points, color }: { points: RoutePointData[], color: string }) => {
  useEffect(() => {
    const mapElement = document.querySelector('[data-map]') as any
    if (!mapElement?.mapInstance || !(window as any).google) return

    const map = mapElement.mapInstance
    const polyline = new (window as any).google.maps.Polyline({
      path: points.map(p => ({ lat: p.latitude, lng: p.longitude })),
      geodesic: false,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 4,
    })

    polyline.setMap(map)

    return () => {
      polyline.setMap(null)
    }
  }, [points, color])

  return null
}

const StopMarker = ({ stop, sequence }: { stop: StopData, sequence: number }) => {
  useEffect(() => {
    const mapElement = document.querySelector('[data-map]') as any
    if (!mapElement?.mapInstance || !(window as any).google) return

    const map = mapElement.mapInstance
    const marker = new (window as any).google.maps.Marker({
      position: { lat: stop.latitude, lng: stop.longitude },
      map: map,
      title: `${sequence}. ${stop.name}`,
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8,
      },
      label: {
        text: sequence.toString(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    })

    return () => {
      marker.setMap(null)
    }
  }, [stop, sequence])

  return null
}