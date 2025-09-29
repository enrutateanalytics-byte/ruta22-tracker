# TEBSA Ruta 22 - Mobile App Setup

Esta aplicación ahora está configurada para ser compilada como una aplicación móvil nativa para Android y iOS usando Capacitor.

## 🚀 Configuración Inicial Completada

✅ **Capacitor instalado y configurado**
- App ID: `app.lovable.a8d559afa6eb489ebabf7d70ef980c74`
- App Name: `TEBSA Ruta 22`
- Hot-reload habilitado para desarrollo

✅ **Plugins instalados:**
- `@capacitor/geolocation` - Para obtener ubicación del usuario
- `@capacitor/status-bar` - Para personalizar la barra de estado
- `@capacitor/splash-screen` - Para pantalla de carga

✅ **Funcionalidades móviles añadidas:**
- Hook `useGeolocation` para obtener ubicación del usuario
- Utilidades de Capacitor para detectar plataforma nativa
- Inicialización automática de plugins nativos

## 📱 Cómo compilar para móvil

### Para probar en tu dispositivo/emulador:

1. **Exporta el proyecto a GitHub** usando el botón "Export to Github" en Lovable
2. **Clona el proyecto** en tu máquina local:
   ```bash
   git clone [tu-repositorio]
   cd [nombre-del-proyecto]
   ```

3. **Instala las dependencias:**
   ```bash
   npm install
   ```

4. **Añade las plataformas móviles:**
   ```bash
   # Para Android
   npx cap add android
   
   # Para iOS (requiere macOS)
   npx cap add ios
   ```

5. **Actualiza las dependencias nativas:**
   ```bash
   # Para Android
   npx cap update android
   
   # Para iOS
   npx cap update ios
   ```

6. **Compila el proyecto web:**
   ```bash
   npm run build
   ```

7. **Sincroniza con las plataformas nativas:**
   ```bash
   npx cap sync
   ```

8. **Ejecuta en dispositivo/emulador:**
   ```bash
   # Para Android (requiere Android Studio)
   npx cap run android
   
   # Para iOS (requiere macOS y Xcode)
   npx cap run ios
   ```

## 🔧 Configuración de Desarrollo

### Android
- Requiere Android Studio instalado
- SDK de Android configurado
- Dispositivo Android o emulador configurado

### iOS
- Requiere macOS
- Xcode instalado
- Dispositivo iOS o simulador

## 📋 Permisos Configurados

- **Geolocalización**: Para mostrar la ubicación del usuario en el mapa
- **Internet**: Para cargar mapas y datos en tiempo real
- **Storage**: Para cache de datos offline

## 🎨 Características Móviles

- **Responsive Design**: La interfaz se adapta perfectamente a móviles
- **Geolocalización**: Detecta automáticamente la ubicación del usuario
- **Status Bar**: Configurada para integrarse con el diseño de la app
- **Splash Screen**: Pantalla de carga personalizada
- **Hot Reload**: Desarrollo en tiempo real desde Lovable

## 📖 Recursos Adicionales

- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Guía de desarrollo móvil de Lovable](https://lovable.dev/blogs/TODO)

## ⚠️ Notas Importantes

- Después de hacer cambios en el código, ejecuta `npx cap sync` para actualizar las apps nativas
- Para builds de producción, necesitarás configurar certificados de firma
- Las funciones de geolocalización solo funcionan en HTTPS o en aplicaciones nativas