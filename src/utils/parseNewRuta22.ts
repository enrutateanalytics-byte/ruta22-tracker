// Parse new Ruta 22 KML coordinates
export const parseNewRuta22Coordinates = (htmlContent: string) => {
  const coordinates: Array<{ lat: number; lng: number }> = [];
  
  // Extract coordinate lines (they follow pattern: longitude,latitude,0)
  const coordRegex = /-?\d+\.\d+,\s*-?\d+\.\d+,\s*0/g;
  const matches = htmlContent.match(coordRegex);
  
  if (matches) {
    matches.forEach(match => {
      const [lng, lat] = match.split(',').map(s => parseFloat(s.trim()));
      coordinates.push({ lat, lng });
    });
  }
  
  return coordinates;
};

export const newRuta22Stops = [
  {
    name: "Terminal Ley Ojo de Agua",
    latitude: 32.470373,
    longitude: -116.7903937,
    order_index: 1
  },
  {
    name: "Punto de control 1 - Soriana Florido",
    latitude: 32.4582988,
    longitude: -116.8930807,
    order_index: 2
  },
  {
    name: "Punto de control 2 - Iglesia de la Curva",
    latitude: 32.4758726,
    longitude: -116.8731149,
    order_index: 3
  },
  {
    name: "Punto de control 3 - Plaza 2000",
    latitude: 32.489601,
    longitude: -116.855494,
    order_index: 4
  },
  {
    name: "Punto de control 4 - Gasolinera Terrazas",
    latitude: 32.4878075,
    longitude: -116.8404515,
    order_index: 5
  },
  {
    name: "Terminal Clínica 1",
    latitude: 32.477431,
    longitude: -116.9261039,
    order_index: 6
  }
];
