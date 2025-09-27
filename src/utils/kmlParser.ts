export interface ParsedStop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  eta: string;
}

export interface ParsedRoute {
  points: Array<{ lat: number; lng: number }>;
  stops: ParsedStop[];
  routeName: string;
}

export async function parseKMLFile(): Promise<ParsedRoute> {
  try {
    const response = await fetch('/route-data.kml');
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
    
    // Extract stops from Placemarks
    const placemarks = kmlDoc.querySelectorAll('Placemark');
    const stops: ParsedStop[] = [];
    
    placemarks.forEach((placemark, index) => {
      const nameElement = placemark.querySelector('name');
      const pointElement = placemark.querySelector('Point coordinates');
      
      if (nameElement?.textContent && pointElement?.textContent) {
        const [lng, lat] = pointElement.textContent.trim().split(',').map(Number);
        const name = nameElement.textContent.trim();
        
        // Extract time from description if available
        const descElement = placemark.querySelector('description');
        let eta = '5 min';
        
        if (descElement?.textContent) {
          const timeMatch = descElement.textContent.match(/(\d{1,2}:\d{2})/);
          if (timeMatch) {
            eta = timeMatch[1];
          }
        }
        
        if (!isNaN(lat) && !isNaN(lng)) {
          stops.push({
            id: index + 1,
            name: name,
            lat,
            lng,
            eta
          });
        }
      }
    });
    
    // Extract route name from Document name
    const docName = kmlDoc.querySelector('Document > name');
    const routeName = docName?.textContent || 'M1 R18 - Apoyo Urbi 2 / Barcelona';
    
    return {
      points: routePoints,
      stops,
      routeName
    };
  } catch (error) {
    console.error('Error parsing KML:', error);
    // Fallback to empty data
    return {
      points: [],
      stops: [],
      routeName: 'M1 R18 - Apoyo Urbi 2 / Barcelona'
    };
  }
}