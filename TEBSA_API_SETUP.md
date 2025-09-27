# TEBSA API Integration Setup

## Configuración de la API Key

Para habilitar el seguimiento en tiempo real de las unidades M1 R18, necesitas configurar la API key de TEBSA.

### Pasos:

1. **Obtener la API Key de TEBSA**
   - Contacta con TEBSA para obtener tu API key
   - La API key te dará acceso al endpoint: `https://wstijuana45da56.nrtec-sys.com/tebsa/getUbicacion`

2. **Configurar la API Key**
   - Abre el archivo: `src/config/tebsa.ts`
   - Reemplaza la línea `API_KEY: ""` con tu API key real:
   ```typescript
   export const TEBSA_CONFIG = {
     API_URL: "https://wstijuana45da56.nrtec-sys.com/tebsa/getUbicacion",
     API_KEY: "tu-api-key-aqui", // 👈 Agrega tu API key aquí
     POLLING_INTERVAL: 30000,
     FALLBACK_TO_SIMULATION: true,
   };
   ```

3. **Funcionamiento**
   - **Con API Key**: La aplicación mostrará ubicaciones reales de las unidades cada 30 segundos
   - **Sin API Key**: La aplicación funcionará con una simulación del recorrido de la ruta

## Características de la Integración

### Datos en Tiempo Real
- ✅ Ubicación GPS (latitud/longitud)
- ✅ Velocidad actual
- ✅ Orientación/dirección
- ✅ Estado de disponibilidad

### UI Mejorada
- 🚌 Marcadores de autobús con orientación visual
- 📶 Indicador de conexión API (WiFi/Sin conexión)
- ⚡ Velocidad en tiempo real en el status bar
- 🕐 Timestamp de última actualización
- 📍 Info popup con detalles al hacer clic en el autobús

### Manejo de Errores
- **Código 1**: Unidad disponible - datos mostrados
- **Código 2**: Unidad no disponible - marcador oculto
- **Código 3**: Error de parámetros - logged en consola
- **Código 4**: Error interno del servidor - retry automático
- **Sin conexión**: Fallback automático a simulación

## Parámetros de la API

- **URL**: `https://wstijuana45da56.nrtec-sys.com/tebsa/getUbicacion`
- **Método**: GET
- **Parámetros**:
  - `id`: 0 para todas las unidades, ID específico para una unidad
  - `apikey`: Tu API key de TEBSA
- **Respuesta**:
  ```json
  {
    "codigo": 1,
    "mensaje": "Disponible",
    "latitud": 32.5150,
    "longitud": -116.9883,
    "velocidad": 45,
    "orientacion": 180
  }
  ```

---

Una vez configurada la API key, la aplicación automáticamente comenzará a mostrar las ubicaciones reales de las unidades M1 R18 en el mapa de Tijuana.