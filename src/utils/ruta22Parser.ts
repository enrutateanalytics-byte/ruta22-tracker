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
    
    // Extract stops from Placemarks (excluding LineString)
    const placemarks = kmlDoc.querySelectorAll('Placemark');
    console.log('🚏 Found placemarks:', placemarks.length);
    const stops: Ruta22Stop[] = [];
    
    placemarks.forEach((placemark, index) => {
      const nameElement = placemark.querySelector('name');
      const pointElement = placemark.querySelector('Point coordinates');
      
      // Skip if this is a LineString placemark
      if (!pointElement) return;
      
      if (nameElement?.textContent && pointElement?.textContent) {
        const [lng, lat] = pointElement.textContent.trim().split(',').map(Number);
        const name = nameElement.textContent.trim();
        
        // Extract time from the name (format: "Location TIME")
        let eta = '5 min';
        const timeMatch = name.match(/(\d{1,2}:\d{2}\s?(?:AM|PM))/i);
        if (timeMatch) {
          eta = timeMatch[1];
        }
        
        // Clean the stop name by removing the time part
        const cleanName = name.replace(/\s*\d{1,2}:\d{2}\s?(?:AM|PM).*$/i, '').trim();
        
        if (!isNaN(lat) && !isNaN(lng) && cleanName) {
          stops.push({
            id: index + 1,
            name: cleanName,
            lat,
            lng,
            eta
          });
        }
      }
    });
    
    console.log('🚏 Parsed', stops.length, 'stops:', stops.map(s => s.name));
    
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