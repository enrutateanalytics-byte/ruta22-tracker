import { routeService } from '@/services/routeService';
import { parseRuta22KML } from './ruta22Parser';

export async function updateRuta22WithKMLData(): Promise<void> {
  try {
    console.log('📋 Parsing Ruta 22 KML data...');
    const kmlData = await parseRuta22KML();
    console.log('📊 KML data parsed:', {
      stops: kmlData.stops.length,
      points: kmlData.points.length,
      routeName: kmlData.routeName
    });
    
    // Get all existing routes to find Ruta 22
    console.log('🔍 Getting existing routes...');
    const existingRoutes = await routeService.getAllRoutes();
    console.log('📈 Found existing routes:', existingRoutes.map(r => r.name));
    
    const ruta22 = existingRoutes.find(route => 
      route.name.toLowerCase().includes('22') || 
      route.name.toLowerCase().includes('ruta 22')
    );
    
    if (!ruta22) {
      console.log('➕ Ruta 22 not found, creating new route...');
      
      // Create new route
      const routeData = {
        name: 'Ruta 22',
        description: 'Ruta principal del sistema de transporte urbano',
        color: '#A52714',
        is_active: true
      };
      
      const stopsData = kmlData.stops.map((stop, index) => ({
        name: stop.name,
        latitude: stop.lat,
        longitude: stop.lng,
        order_index: index + 1,
        route_id: '' // Will be filled by the service
      }));
      
      const pointsData = kmlData.points.map((point, index) => ({
        latitude: point.lat,
        longitude: point.lng,
        order_index: index + 1,
        route_id: '' // Will be filled by the service
      }));
      
      const result = await routeService.createRoute(routeData, stopsData, pointsData);
      
      if (result.success) {
        console.log('✅ Ruta 22 created successfully!');
      } else {
        console.error('❌ Failed to create Ruta 22');
      }
    } else {
      console.log('🔄 Updating existing Ruta 22:', ruta22.name);
      console.log('🆔 Route ID:', ruta22.id);
      
      // Update existing route
      const routeData = {
        name: 'Ruta 22',
        description: 'Ruta principal del sistema de transporte urbano',
        color: '#A52714',
        is_active: true
      };
      
      const stopsData = kmlData.stops.map((stop, index) => ({
        name: stop.name,
        latitude: stop.lat,
        longitude: stop.lng,
        order_index: index + 1,
        route_id: ruta22.id
      }));
      
      const pointsData = kmlData.points.map((point, index) => ({
        latitude: point.lat,
        longitude: point.lng,
        order_index: index + 1,
        route_id: ruta22.id
      }));
      
      const result = await routeService.updateRoute(ruta22.id, routeData, stopsData, pointsData);
      
      if (result.success) {
        console.log('✅ Ruta 22 updated successfully!');
        // Reload the page to show the updated route
        window.location.reload();
      } else {
        console.error('❌ Failed to update Ruta 22');
      }
    }
  } catch (error) {
    console.error('Error updating Ruta 22:', error);
    throw error;
  }
}