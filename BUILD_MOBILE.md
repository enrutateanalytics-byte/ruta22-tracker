# 📱 TEBSA Ruta 22 - Guía de Compilación Móvil

Esta guía te ayudará a compilar la aplicación TEBSA Ruta 22 para dispositivos Android e iOS.

## 🚀 Preparación del Entorno

### Requerimientos Generales
- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git** instalado

### Para Android
- **Android Studio** (última versión)
- **Android SDK** configurado
- **Java JDK 17** o superior

### Para iOS (solo macOS)
- **Xcode** 15.0 o superior
- **iOS SDK** 16.0 o superior
- **Cuenta de desarrollador de Apple** (para distribución)

## 📦 Configuración Inicial

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd tebsa-ruta22-mobile
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Agregar plataformas móviles**
```bash
# Para Android
npx cap add android

# Para iOS (solo en macOS)
npx cap add ios
```

## 🔧 Proceso de Compilación

### Compilación Automática (Recomendado)
```bash
# Ejecutar script de build completo
npm run build:mobile
```

### Compilación Manual
```bash
# 1. Compilar proyecto web
npm run build

# 2. Sincronizar con plataformas nativas
npx cap sync

# 3. Generar iconos y splash screens (opcional)
npm install -g @capacitor/assets
npx capacitor-assets generate
```

## 📱 Ejecutar en Dispositivos

### Android
```bash
# Ejecutar en emulador o dispositivo conectado
npx cap run android

# Para build de producción
npx cap run android --prod
```

### iOS
```bash
# Abrir en Xcode para configuración final
npx cap open ios

# Ejecutar directamente (si está configurado)
npx cap run ios --prod
```

## 📋 Generar APK/AAB (Android)

### Desde Android Studio
1. Abrir el proyecto: `android/`
2. Build → Generate Signed Bundle/APK
3. Seleccionar **Android App Bundle (AAB)** para Google Play
4. Configurar keystore y firmar

### Línea de comandos
```bash
cd android
./gradlew assembleRelease  # Para APK
./gradlew bundleRelease    # Para AAB
```

Los archivos generados estarán en:
- APK: `android/app/build/outputs/apk/release/`
- AAB: `android/app/build/outputs/bundle/release/`

## 🍎 Generar IPA (iOS)

1. Abrir proyecto en Xcode: `npx cap open ios`
2. Seleccionar equipo de desarrollo
3. Configurar Bundle Identifier único
4. Product → Archive
5. Distribuir a App Store Connect o Ad-hoc

## 🔐 Configuración de Firmas

### Android Keystore
```bash
# Generar keystore (solo primera vez)
keytool -genkey -v -keystore tebsa-release-key.keystore -alias tebsa -keyalg RSA -keysize 2048 -validity 10000

# Configurar en android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=tebsa-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=tebsa
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***
```

### iOS Certificados
1. Acceder a [Apple Developer Portal](https://developer.apple.com)
2. Crear App ID con Bundle Identifier: `app.lovable.a8d559afa6eb489ebabf7d70ef980c74`
3. Generar certificados de desarrollo y distribución
4. Crear provisioning profiles
5. Configurar en Xcode

## 🧪 Testing en Dispositivos

### Android
```bash
# Instalar APK directamente
adb install app-release.apk

# Ver logs en tiempo real
adb logcat | grep TebsaApp
```

### iOS
```bash
# Usar Xcode para instalar en dispositivo
# O usar TestFlight para distribución beta
```

## 🚀 Scripts NPM Disponibles

```bash
npm run build:mobile      # Build completo para móvil
npm run sync:android      # Sincronizar solo Android
npm run sync:ios          # Sincronizar solo iOS
npm run open:android      # Abrir Android Studio
npm run open:ios          # Abrir Xcode
```

## 🔧 Troubleshooting

### Errores Comunes

**Android: "SDK not found"**
```bash
# Configurar ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**iOS: "No se puede abrir Xcode"**
```bash
# Verificar instalación de Xcode
sudo xcode-select --install
```

**Capacitor: "Platform not found"**
```bash
# Reinstalar plataformas
npx cap add android --force
npx cap add ios --force
```

### Limpieza Completa
```bash
# Limpiar todo y empezar de nuevo
rm -rf node_modules android ios dist
npm install
npm run build:mobile
```

## 📝 Notas Importantes

- **Geolocation**: La app requiere permisos de ubicación
- **Internet**: Necesaria conexión para datos en tiempo real
- **Orientación**: Configurada solo para vertical (portrait)
- **Target SDK**: Android 34, iOS 16.0+

## 🆘 Soporte

Para problemas específicos de compilación:
1. Revisar logs de console: `npx cap run android --consolelogs`
2. Verificar configuraciones en `capacitor.config.ts`
3. Consultar documentación oficial: [Capacitor Docs](https://capacitorjs.com/docs)

---

**¡La app TEBSA Ruta 22 está lista para dispositivos móviles! 🚌📱**