export interface Ruta22Stop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  eta: string;
}

export interface Ruta22Data {
  points: Array<{ lat: number; lng: number }>;
  stops: Ruta22Stop[];
  routeName: string;
}

export async function parseRuta22KML(): Promise<Ruta22Data> {
  try {
    console.log('🔗 Fetching KML file from /ruta-22.kml');
    const response = await fetch('/ruta-22.kml');
    
    if (!response.ok) {
      console.error('❌ Failed to fetch KML file:', response.status, response.statusText);
      throw new Error(`Failed to fetch KML file: ${response.status}`);
    }
    
    const kmlText = await response.text();
    console.log('📄 KML file loaded, size:', kmlText.length, 'characters');
    
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
    
    console.log('🔍 Parsing XML document...');
    
    // Extract route points from LineString
    const lineString = kmlDoc.querySelector('LineString coordinates');
    console.log('🛣️ Found LineString:', !!lineString);
    const routePoints: Array<{ lat: number; lng: number }> = [];
    
    if (lineString?.textContent) {
      const coords = lineString.textContent.trim().split(/\s+/);
      console.log('📍 Found coordinates count:', coords.length);
      
      coords.forEach(coord => {
        const [lng, lat] = coord.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          routePoints.push({ lat, lng });
        }
      });
    }
    
    console.log('✅ Parsed', routePoints.length, 'route points');
    
    // No stops - only show the route
    const stops: Ruta22Stop[] = [];
    console.log('🚏 No stops configured - route only mode');
    
    return {
      points: routePoints,
      stops,
      routeName: 'Ruta 22'
    };
  } catch (error) {
    console.error('❌ Error parsing Ruta 22 KML:', error);
    return {
      points: [],
      stops: [],
      routeName: 'Ruta 22'
    };
  }
}