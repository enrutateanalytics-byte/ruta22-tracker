import { useState, useEffect } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface GeolocationState {
  position: Position | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (enableHighAccuracy = true) => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false
  });

  const getCurrentPosition = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (Capacitor.isNativePlatform()) {
        // Request permissions on native platforms
        const permissions = await Geolocation.requestPermissions();
        if (permissions.location !== 'granted') {
          throw new Error('Location permission denied');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout: 10000
      });

      setState({
        position,
        error: null,
        loading: false
      });

      return position;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setState({
        position: null,
        error: errorMessage,
        loading: false
      });
      throw error;
    }
  };

  const watchPosition = (callback: (position: Position) => void) => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web
      return null;
    }

    return Geolocation.watchPosition({
      enableHighAccuracy,
      timeout: 10000
    }, callback);
  };

  useEffect(() => {
    // Auto-get position on mount if on native platform
    if (Capacitor.isNativePlatform()) {
      getCurrentPosition().catch(() => {
        // Silently handle permission denied or other errors
      });
    }
  }, []);

  return {
    ...state,
    getCurrentPosition,
    watchPosition
  };
};