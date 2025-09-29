import { routeService } from '@/services/routeService';

export async function importRealKMLRoute(): Promise<void> {
  try {
    console.log('Fetching KML file from /route-data-real.kml');
    const response = await fetch('/route-data-real.kml');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch KML file: ${response.status}`);
    }
    
    const kmlContent = await response.text();
    console.log('KML file loaded, size:', kmlContent.length, 'characters');
    
    // First, let's clear the existing routes
    const existingRoutes = await routeService.getAllRoutes();
    console.log('Found', existingRoutes.length, 'existing routes to clear');
    
    for (const route of existingRoutes) {
      await routeService.deleteRoute(route.id);
      console.log('Deleted route:', route.name);
    }
    
    // Import the new route from KML
    console.log('Importing route from KML...');
    const result = await routeService.importFromKML(kmlContent);
    
    if (result.success) {
      console.log('✅ Route imported successfully!');
      console.log('New route:', result.route);
      
      // Reload the page to show the new route
      window.location.reload();
    } else {
      console.error('❌ Failed to import route');
    }
  } catch (error) {
    console.error('Error importing real KML route:', error);
    throw error;
  }
}