import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const initializeCapacitor = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Configure status bar
    await StatusBar.setStyle({ style: Style.Default });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
    
    // Hide splash screen after app is ready
    await SplashScreen.hide();
    
    console.log('[Capacitor] Native platform initialized');
  } catch (error) {
    console.error('[Capacitor] Initialization error:', error);
  }
};

export const isNativeApp = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};