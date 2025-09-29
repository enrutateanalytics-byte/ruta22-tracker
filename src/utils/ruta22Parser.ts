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
    const response = await fetch('/ruta-22.kml');
    const kmlText = await response.text();
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
    
    // Extract route points from LineString
    const lineString = kmlDoc.querySelector('LineString coordinates');
    const routePoints: Array<{ lat: number; lng: number }> = [];
    
    if (lineString?.textContent) {
      const coords = lineString.textContent.trim().split(/\s+/);
      coords.forEach(coord => {
        const [lng, lat] = coord.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          routePoints.push({ lat, lng });
        }
      });
    }
    
    // Extract stops from Placemarks (excluding LineString)
    const placemarks = kmlDoc.querySelectorAll('Placemark');
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
    
    return {
      points: routePoints,
      stops,
      routeName: 'Ruta 22'
    };
  } catch (error) {
    console.error('Error parsing Ruta 22 KML:', error);
    return {
      points: [],
      stops: [],
      routeName: 'Ruta 22'
    };
  }
}