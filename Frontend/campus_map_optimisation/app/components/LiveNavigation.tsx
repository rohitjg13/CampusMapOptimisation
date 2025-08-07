'use client';

import { useEffect, useState } from 'react';
import { Navigation, MapPin, RotateCcw, PlayCircle, StopCircle, AlertTriangle } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';
import { useLocation } from '../contexts/LocationContext';

interface LiveNavigationProps {
  destination: { lat: number; lng: number; name?: string } | null;
  onNavigationEnd?: () => void;
}

export default function LiveNavigation({ destination, onNavigationEnd }: LiveNavigationProps) {
  const { startTracking, stopTracking, isTracking, hasLocationPermission, error: locationError, requestLocationPermission } = useLocation();
  const {
    currentRoute,
    isNavigating,
    nextInstruction,
    routeProgress,
    distanceToNextInstruction,
    distanceToRoute,
    shouldRecalculate,
    isRecalculating,
    startNavigation,
    stopNavigation,
    recalculateRoute,
  } = useNavigation({ destination });

  const [hasStartedNavigation, setHasStartedNavigation] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleStartNavigation = async () => {
    setIsRequestingPermission(true);
    
    try {
      // First, explicitly request location permission
      const permissionGranted = await requestLocationPermission();
      
      if (permissionGranted) {
        // Start tracking location
        if (!isTracking) {
          startTracking();
        }
        
        // Start navigation
        await startNavigation();
        setHasStartedNavigation(true);
      } else {
        // Permission denied, show error message
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Failed to start navigation:', error);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleStopNavigation = () => {
    stopNavigation();
    setHasStartedNavigation(false);
    onNavigationEnd?.();
  };

  useEffect(() => {
    if (hasLocationPermission && !isTracking && destination) {
      startTracking();
    }
  }, [hasLocationPermission, isTracking, destination, startTracking]);

  if (!destination) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Live Navigation</h3>
              <p className="text-sm text-blue-100">
                To {destination.name || 'destination'}
              </p>
            </div>
          </div>
          
          {!hasStartedNavigation ? (
            <button
              onClick={handleStartNavigation}
              disabled={isRequestingPermission}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isRequestingPermission ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                  Requesting...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2 inline" />
                  Start
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleStopNavigation}
              className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <StopCircle className="h-4 w-4 mr-2 inline" />
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!hasLocationPermission && !isTracking && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Location Permission Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  Click "Start" to enable location access for turn-by-turn navigation
                </p>
              </div>
            </div>
          </div>
        )}

        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Location Error</p>
                <p className="text-xs text-red-700 mt-1">{locationError}</p>
              </div>
            </div>
          </div>
        )}

        {isNavigating && currentRoute && (
          <>
            {/* Route Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{Math.round(routeProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full navigation-progress-bar"
                  style={{ width: `${routeProgress}%` }}
                ></div>
              </div>
            </div>

            {nextInstruction && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Navigation className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">{nextInstruction.instruction}</p>
                    {distanceToNextInstruction > 0 && (
                      <p className="text-sm text-blue-700 mt-1">
                        In {Math.round(distanceToNextInstruction)}m
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {shouldRecalculate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Route Deviation</p>
                      <p className="text-xs text-amber-700 mt-1">
                        You're {Math.round(distanceToRoute)}m from the route
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={recalculateRoute}
                    disabled={isRecalculating}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isRecalculating ? (
                      <div className="h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-3 w-3 mr-1 inline" />
                        Recalculate
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">{currentRoute.total_distance}m</p>
                <p className="text-xs text-gray-600">Total Distance</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">{currentRoute.estimated_time_minutes}min</p>
                <p className="text-xs text-gray-600">Est. Time</p>
              </div>
            </div>

            {isRecalculating && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-blue-800">Recalculating route...</p>
                </div>
              </div>
            )}
          </>
        )}

        {!isNavigating && hasLocationPermission && (
          <div className="text-center py-4">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Ready to start navigation to your destination
            </p>
            <p className="text-xs text-gray-500">
              We'll track your location and provide turn-by-turn directions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
