export const initializeCapacitor = async () => {
  try {
    // Dynamically import Capacitor only when needed
    const { Capacitor } = await import('@capacitor/core');
    
    if (!Capacitor.isNativePlatform()) {
      console.log('[Capacitor] Running on web platform, skipping native initialization');
      return;
    }

    // Only import native plugins when on native platform
    const [{ StatusBar, Style }, { SplashScreen }] = await Promise.all([
      import('@capacitor/status-bar'),
      import('@capacitor/splash-screen')
    ]);

    // Configure status bar
    await StatusBar.setStyle({ style: Style.Default });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
    
    // Hide splash screen after app is ready
    await SplashScreen.hide();
    
    console.log('[Capacitor] Native platform initialized');
  } catch (error) {
    console.log('[Capacitor] Not available in this environment, continuing with web version');
  }
};

export const isNativeApp = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const getPlatform = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
};

export const isAndroid = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
};

export const isIOS = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
};