'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, MapPin, Clock, Route, Loader, Maximize2, Minimize2, X, List, Map } from 'lucide-react';
import RouteForm from './components/RouteForm';
import RouteResult from './components/RouteResult';
import RouteDirections from './components/RouteDirections';
import { RouteData } from './types/route';

// Dynamically import the map component to avoid SSR issues
const RouteMap = dynamic(() => import('./components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
});

export default function Home() {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<'start' | 'end' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(true);
  const [showDirections, setShowDirections] = useState(false);
  const [coordinates, setCoordinates] = useState({
    startLat: 28.525237,
    startLng: 77.570965,
    endLat: 28.525503,
    endLng: 77.575042,
  });

  const handleRouteCalculation = async (coords: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
  }) => {
    setLoading(true);
    setError(null);
    setRoute(null);
    setCoordinates(coords);

    try {
      const { startLat, startLng, endLat, endLng } = coords;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.101:8000';
      const url = `${apiUrl}/route?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRoute(data.route);
      } else {
        setError(data.error || 'Failed to calculate route');
      }
    } catch (err) {
      setError('Failed to connect to the API. Please check if the backend server is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRoute(null);
    setError(null);
    setSelectedLocation(null);
    setShowRouteForm(true);
    setShowDirections(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (selectedLocation === 'start') {
      setCoordinates(prev => ({ ...prev, startLat: lat, startLng: lng }));
    } else if (selectedLocation === 'end') {
      setCoordinates(prev => ({ ...prev, endLat: lat, endLng: lng }));
    }
    setSelectedLocation(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Fullscreen Map Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Campus Navigator</h1>
                {route && (
                  <p className="text-sm text-gray-600">
                    {route.total_distance}m • {route.estimated_time_minutes} min
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {route && (
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setShowDirections(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      !showDirections ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                    aria-label="Show map"
                  >
                    <Map className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDirections(true)}
                    className={`p-2 rounded-lg transition-colors ${
                      showDirections ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                    aria-label="Show directions"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                aria-label="Exit fullscreen"
                title="Exit fullscreen"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Map */}
        <div className="h-full pt-16">
          {showDirections && route ? (
            <div className="h-full p-4 overflow-y-auto bg-gray-50">
              <RouteDirections route={route} onReset={handleReset} />
            </div>
          ) : (
            <RouteMap 
              route={route} 
              height="100vh"
              onMapClick={!route ? handleMapClick : undefined}
              selectedLocation={selectedLocation}
            />
          )}
        </div>

        {/* Floating Route Form */}
        {!route && showRouteForm && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Plan Route</h3>
              <button
                onClick={() => setShowRouteForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                aria-label="Close route form"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <RouteForm 
              onSubmit={handleRouteCalculation} 
              loading={loading} 
              onReset={handleReset}
              coordinates={coordinates}
              onCoordinateChange={setCoordinates}
              onLocationSelect={setSelectedLocation}
            />
          </div>
        )}

        {/* Floating Show Form Button */}
        {!route && !showRouteForm && (
          <button
            onClick={() => setShowRouteForm(true)}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
            aria-label="Show route form"
            title="Plan route"
          >
            <MapPin className="h-6 w-6" />
          </button>
        )}

        {/* Route Results */}
        {route && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[60vh] overflow-y-auto">
            <RouteResult route={route} onReset={handleReset} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Route className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Route Calculation Failed</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
                aria-label="Dismiss error"
                title="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Campus Navigator</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Find your way around campus</p>
              </div>
            </div>
            {route && (
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{route.total_distance}m</p>
                <p className="text-xs text-gray-600">{route.estimated_time_minutes} min</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Map Section - Now takes priority */}
        <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh]">
          <RouteMap 
            route={route} 
            height="100%"
            onMapClick={!route ? handleMapClick : undefined}
            selectedLocation={selectedLocation}
          />
          
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 z-10"
            aria-label="Enter fullscreen"
            title="Fullscreen map"
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          {/* Map/Directions Toggle */}
          {route && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                <button
                  onClick={() => setShowDirections(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    !showDirections ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="Show map"
                >
                  <Map className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDirections(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    showDirections ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="Show directions"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
                <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900">Finding Route</p>
                <p className="text-sm text-gray-600">Please wait...</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sheet Content */}
        <div className="bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 -mt-6 relative z-10">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-6"></div>
          
          <div className="px-4 pb-4 sm:px-6 space-y-6">
            {/* Route Form */}
            {!route && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Plan Your Journey</h2>
                </div>
                <RouteForm 
                  onSubmit={handleRouteCalculation} 
                  loading={loading} 
                  onReset={handleReset}
                  coordinates={coordinates}
                  onCoordinateChange={setCoordinates}
                  onLocationSelect={setSelectedLocation}
                />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-xl">
                    <Route className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800">Route Calculation Failed</h3>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 p-1"
                    aria-label="Dismiss error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Route Result or Directions */}
            {route && (
              showDirections ? (
                <RouteDirections route={route} onReset={handleReset} />
              ) : (
                <RouteResult route={route} onReset={handleReset} />
              )
            )}

            {/* Quick Tips - Only show when no route */}
            {!route && !loading && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">Navigation Tips</h3>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Select from predefined campus locations</li>
                      <li>• Use current location for your starting point</li>
                      <li>• Tap fullscreen for better map viewing</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
