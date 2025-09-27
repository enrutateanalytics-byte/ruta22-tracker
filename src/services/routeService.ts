import { getSupabaseClient } from '@/lib/supabase'

export interface RouteData {
  id?: string
  name: string
  description?: string
  color?: string
  is_active?: boolean
}

export interface StopData {
  id?: string
  name: string
  latitude: number
  longitude: number
  estimated_time?: string
}

export interface RoutePointData {
  latitude: number
  longitude: number
}

export interface CompleteRoute {
  id: string
  name: string
  description?: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
  stops: Array<StopData & { sequence_order: number }>
  points: Array<RoutePointData & { sequence_order: number }>
}

class RouteService {
  private checkSupabaseConnection() {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase is not connected. Please connect to Supabase to use admin features.')
    }
    return supabase
  }

  async getAllRoutes(): Promise<CompleteRoute[]> {
    try {
      const supabase = this.checkSupabaseConnection()
      const { data, error } = await supabase.functions.invoke('routes', {
        method: 'GET'
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching routes:', error)
      throw error
    }
  }

  async getRoute(routeId: string): Promise<CompleteRoute> {
    try {
      const supabase = this.checkSupabaseConnection()
      const { data, error } = await supabase.functions.invoke(`routes/${routeId}`, {
        method: 'GET'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching route:', error)
      throw error
    }
  }

  async createRoute(
    route: RouteData, 
    stops: StopData[], 
    points: RoutePointData[]
  ): Promise<{ success: boolean; route: any }> {
    try {
      const supabase = this.checkSupabaseConnection()
      const { data, error } = await supabase.functions.invoke('routes', {
        method: 'POST',
        body: { route, stops, points }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating route:', error)
      throw error
    }
  }

  async updateRoute(
    routeId: string,
    route: RouteData, 
    stops: StopData[], 
    points: RoutePointData[]
  ): Promise<{ success: boolean }> {
    try {
      const supabase = this.checkSupabaseConnection()
      const { data, error } = await supabase.functions.invoke(`routes/${routeId}`, {
        method: 'PUT',
        body: { route, stops, points }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating route:', error)
      throw error
    }
  }

  async deleteRoute(routeId: string): Promise<{ success: boolean }> {
    try {
      const supabase = this.checkSupabaseConnection()
      const { data, error } = await supabase.functions.invoke(`routes/${routeId}`, {
        method: 'DELETE'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error deleting route:', error)
      throw error
    }
  }

  async importFromKML(kmlContent: string): Promise<{ success: boolean; route: any }> {
    try {
      // Parse KML content similar to existing kmlParser
      const parser = new DOMParser()
      const kmlDoc = parser.parseFromString(kmlContent, 'text/xml')
      
      // Extract route points from LineString
      const lineString = kmlDoc.querySelector('LineString coordinates')
      const points: RoutePointData[] = []
      
      if (lineString?.textContent) {
        const coords = lineString.textContent.trim().split(/\s+/)
        coords.forEach(coord => {
          const [lng, lat] = coord.split(',').map(Number)
          if (!isNaN(lat) && !isNaN(lng)) {
            points.push({ latitude: lat, longitude: lng })
          }
        })
      }
      
      // Extract stops from Placemarks
      const placemarks = kmlDoc.querySelectorAll('Placemark')
      const stops: StopData[] = []
      
      placemarks.forEach((placemark) => {
        const nameElement = placemark.querySelector('name')
        const pointElement = placemark.querySelector('Point coordinates')
        
        if (nameElement?.textContent && pointElement?.textContent) {
          const [lng, lat] = pointElement.textContent.trim().split(',').map(Number)
          const name = nameElement.textContent.trim()
          
          // Extract time from description if available
          const descElement = placemark.querySelector('description')
          let estimatedTime = '5 min'
          
          if (descElement?.textContent) {
            const timeMatch = descElement.textContent.match(/(\d{1,2}:\d{2})/)
            if (timeMatch) {
              estimatedTime = timeMatch[1]
            }
          }
          
          if (!isNaN(lat) && !isNaN(lng)) {
            stops.push({
              name,
              latitude: lat,
              longitude: lng,
              estimated_time: estimatedTime
            })
          }
        }
      })
      
      // Extract route name from Document name
      const docName = kmlDoc.querySelector('Document > name')
      const routeName = docName?.textContent || 'Imported Route'
      
      const route: RouteData = {
        name: routeName,
        description: 'Imported from KML file',
        color: '#10b981'
      }
      
      return await this.createRoute(route, stops, points)
    } catch (error) {
      console.error('Error importing KML:', error)
      throw new Error('Failed to import KML file')
    }
  }
}

export const routeService = new RouteService()