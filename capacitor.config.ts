import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a8d559afa6eb489ebabf7d70ef980c74',
  appName: 'TEBSA Ruta 22',
  webDir: 'dist',
  server: {
    url: 'https://a8d559af-a6eb-489e-babf-7d70ef980c74.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: {
        // Request location permissions
        location: "when-in-use",
      }
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff',
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'AAB',
      signingType: 'jarsigner'
    }
  },
  ios: {
    scheme: 'TEBSA Ruta 22'
  }
};

export default config;