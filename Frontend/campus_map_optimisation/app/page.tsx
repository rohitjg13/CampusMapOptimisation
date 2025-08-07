'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import RouteForm from './components/RouteForm';
import RouteResult from './components/RouteResult';
import LiveNavigation from './components/LiveNavigation';
import { LocationProvider } from './contexts/LocationContext';
import type { RouteFormData, RouteData as RouteDataType } from './types/route';
import { Loader } from 'lucide-react';

// Define LocationPoint type locally for now
interface LocationPoint {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

// Dynamically import RouteMap to avoid SSR issues
const RouteMap = dynamic(() => import('./components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [routeData, setRouteData] = useState<RouteDataType | null>(null);
  const [selectedFromLocation, setSelectedFromLocation] = useState<LocationPoint | null>(null);
  const [selectedToLocation, setSelectedToLocation] = useState<LocationPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigationMode, setIsNavigationMode] = useState(false);

  const handleRouteSubmit = async (formData: RouteFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build URL with query parameters - more robust approach
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const params = new URLSearchParams({
        start_lat: formData.startLat.toString(),
        start_lng: formData.startLng.toString(),
        end_lat: formData.endLat.toString(),
        end_lng: formData.endLng.toString()
      });
      
      const fullUrl = `${baseUrl}/route?${params.toString()}`;
      console.log('Fetching route from:', fullUrl); // Debug log

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          "ngrok-skip-browser-warning": "69420",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Check if the response indicates success
      if (data.success && data.route) {
        setRouteData(data.route); // Extract the actual route data
      } else {
        throw new Error(data.error || 'Failed to calculate route');
      }
      
      // Set location data for navigation
      setSelectedFromLocation({
        name: 'Start Location',
        coordinates: [formData.startLng, formData.startLat]
      });
      setSelectedToLocation({
        name: 'Destination',
        coordinates: [formData.endLng, formData.endLat]
      });
    } catch (err) {
      console.error('Error fetching route:', err);
      
      // More specific error messages
      if (err instanceof TypeError && err.message.includes('string did not match the expected pattern')) {
        setError('Invalid URL format. Please check your network connection and try again.');
      } else if (err instanceof SyntaxError) {
        setError('Invalid response from server. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message.includes('Failed to fetch') 
          ? 'Cannot connect to the server. Please ensure the backend is running.' 
          : err.message
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNavigation = () => {
    setIsNavigationMode(true);
  };

  const handleStopNavigation = () => {
    setIsNavigationMode(false);
  };

  const navigationDestination = selectedToLocation ? {
    lat: selectedToLocation.coordinates[1],
    lng: selectedToLocation.coordinates[0],
    name: selectedToLocation.name
  } : null;

  return (
    <LocationProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Campus Map Navigation
            </h1>
            <p className="text-lg text-gray-600">
              Find the optimal route between any two locations on campus with live GPS navigation
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Controls */}
            <div className="space-y-6">
              {/* Route Form */}
              <RouteForm onSubmit={handleRouteSubmit} loading={isLoading} onReset={() => setRouteData(null)} />
              
              {/* Route Result */}
              {routeData && (
                <RouteResult
                  route={routeData}
                  onStartNavigation={handleStartNavigation}
                  isNavigationMode={isNavigationMode}
                  onReset={() => setRouteData(null)}
                />
              )}

              {/* Live Navigation */}
              {isNavigationMode && routeData && (
                <LiveNavigation
                  destination={navigationDestination}
                  onNavigationEnd={handleStopNavigation}
                />
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Map */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="h-[600px]">
                  <RouteMap
                    route={routeData}
                    isNavigating={isNavigationMode}
                    showUserLocation={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 py-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Campus Navigation System - Optimized routes with real-time GPS navigation
            </p>
          </div>
        </div>
      </div>
    </LocationProvider>
  );
}
