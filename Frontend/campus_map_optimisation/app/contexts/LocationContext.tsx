'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface LocationContextType {
  currentLocation: LocationData | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  hasLocationPermission: boolean;
  requestLocationPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const checkLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      const isGranted = permission.state === 'granted';
      setHasLocationPermission(isGranted);
      return isGranted;
    } catch {
      // Fallback for browsers that don't support permissions API
      // Don't assume permission is granted, let the user trigger the request
      setHasLocationPermission(false);
      return false;
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setError(null);
    setIsTracking(true);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout
      maximumAge: 5000,
    };

    const successCallback = (position: GeolocationPosition) => {
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp,
      };

      setCurrentLocation(locationData);
      setHasLocationPermission(true);
      setError(null);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = 'Location access denied';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services and refresh the page.';
          setHasLocationPermission(false);
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable. Please check your GPS.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
      }

      setError(errorMessage);
      setIsTracking(false);
    };

    const id = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    setWatchId(id);
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return false;
    }

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setHasLocationPermission(true);
          setError(null);
          resolve(true);
        },
        (error) => {
          let errorMessage = 'Location access denied';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services in your browser settings.';
              setHasLocationPermission(false);
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your GPS.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }

          setError(errorMessage);
          setHasLocationPermission(false);
          resolve(false);
        },
        options
      );
    });
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  useEffect(() => {
    checkLocationPermission();
    
    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [checkLocationPermission, watchId]);

  const value: LocationContextType = {
    currentLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
    hasLocationPermission,
    requestLocationPermission,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
