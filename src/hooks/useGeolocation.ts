import { useState, useEffect } from 'react';

interface Position {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
}

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
      // Try to use Capacitor Geolocation first
      try {
        const [{ Capacitor }, { Geolocation }] = await Promise.all([
          import('@capacitor/core'),
          import('@capacitor/geolocation')
        ]);

        if (Capacitor.isNativePlatform()) {
          // Request permissions on native platforms
          const permissions = await Geolocation.requestPermissions();
          if (permissions.location !== 'granted') {
            throw new Error('Location permission denied');
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
        }
      } catch (capacitorError) {
        console.log('[Geolocation] Capacitor not available, falling back to web API');
      }

      // Fallback to web API
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const formattedPosition: Position = {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
        },
        timestamp: position.timestamp
      };

      setState({
        position: formattedPosition,
        error: null,
        loading: false
      });

      return formattedPosition;
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

  const watchPosition = async (callback: (position: Position) => void) => {
    try {
      const [{ Capacitor }, { Geolocation }] = await Promise.all([
        import('@capacitor/core'),
        import('@capacitor/geolocation')
      ]);

      if (Capacitor.isNativePlatform()) {
        return Geolocation.watchPosition({
          enableHighAccuracy,
          timeout: 10000
        }, callback);
      }
    } catch {
      // Fallback to web API
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const formattedPosition: Position = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude ?? undefined,
                altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
                heading: position.coords.heading ?? undefined,
                speed: position.coords.speed ?? undefined,
              },
              timestamp: position.timestamp
            };
            callback(formattedPosition);
          },
          (error) => {
            console.error('[Geolocation] Watch position error:', error);
          },
          {
            enableHighAccuracy,
            timeout: 10000,
            maximumAge: 60000
          }
        );
        return { remove: () => navigator.geolocation.clearWatch(watchId) };
      }
    }

    return null;
  };

  return {
    ...state,
    getCurrentPosition,
    watchPosition
  };
};