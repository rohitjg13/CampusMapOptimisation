'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, RotateCcw, ArrowRight, Map } from 'lucide-react';
import { RouteFormData } from '../types/route';
import { Location } from '../types/location';
import LocationSelector from './LocationSelector';

interface RouteFormProps {
  onSubmit: (data: RouteFormData) => void;
  loading: boolean;
  onReset: () => void;
  coordinates?: RouteFormData;
  onCoordinateChange?: (coords: RouteFormData) => void;
  onLocationSelect?: (location: 'start' | 'end' | null) => void;
}

export default function RouteForm({ 
  onSubmit, 
  loading, 
  onReset, 
  coordinates,
  onCoordinateChange,
  onLocationSelect 
}: RouteFormProps) {
  const [formData, setFormData] = useState<RouteFormData>(
    coordinates || {
      startLat: 28.525237,
      startLng: 77.570965,
      endLat: 28.525503,
      endLng: 77.575042,
    }
  );

  const [selectedStartLocation, setSelectedStartLocation] = useState<Location | null>(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState<Location | null>(null);

  const [errors, setErrors] = useState<Partial<RouteFormData>>({});

  // Sync with external coordinates
  useEffect(() => {
    if (coordinates) {
      setFormData(coordinates);
    }
  }, [coordinates]);

  const validateForm = (): boolean => {
    return selectedStartLocation !== null && selectedEndLocation !== null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    const defaultData = {
      startLat: 28.525237,
      startLng: 77.570965,
      endLat: 28.525503,
      endLng: 77.575042,
    };
    setFormData(defaultData);
    setErrors({});
    setSelectedStartLocation(null);
    setSelectedEndLocation(null);
    
    // Notify parent component
    if (onCoordinateChange) {
      onCoordinateChange(defaultData);
    }
    
    onReset();
  };

  const handleStartLocationChange = (location: Location | null) => {
    setSelectedStartLocation(location);
    if (location) {
      const newFormData = {
        ...formData,
        startLat: location.lat,
        startLng: location.lng,
      };
      setFormData(newFormData);
      if (onCoordinateChange) {
        onCoordinateChange(newFormData);
      }
    }
  };

  const handleEndLocationChange = (location: Location | null) => {
    setSelectedEndLocation(location);
    if (location) {
      const newFormData = {
        ...formData,
        endLat: location.lat,
        endLng: location.lng,
      };
      setFormData(newFormData);
      if (onCoordinateChange) {
        onCoordinateChange(newFormData);
      }
    }
  };

  const swapLocations = () => {
    const swappedData = {
      startLat: formData.endLat,
      startLng: formData.endLng,
      endLat: formData.startLat,
      endLng: formData.startLng,
    };
    setFormData(swappedData);
    
    // Swap selected locations too
    const tempLocation = selectedStartLocation;
    setSelectedStartLocation(selectedEndLocation);
    setSelectedEndLocation(tempLocation);
    
    // Notify parent component
    if (onCoordinateChange) {
      onCoordinateChange(swappedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Start Location Selector */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Starting Point</h3>
            <p className="text-sm text-gray-500">Where are you starting from?</p>
          </div>
        </div>
        <LocationSelector
          value={selectedStartLocation}
          onChange={handleStartLocationChange}
          placeholder="Choose your starting location"
          allowCurrentLocation={true}
          excludeLocationId={selectedEndLocation?.id}
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={swapLocations}
          disabled={loading || !selectedStartLocation || !selectedEndLocation}
          className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Swap start and end locations"
        >
          <RotateCcw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>

      {/* End Location Selector */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Destination</h3>
            <p className="text-sm text-gray-500">Where do you want to go?</p>
          </div>
        </div>
        <LocationSelector
          value={selectedEndLocation}
          onChange={handleEndLocationChange}
          placeholder="Choose your destination"
          allowCurrentLocation={false}
          excludeLocationId={selectedStartLocation?.id}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !selectedStartLocation || !selectedEndLocation}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
        >
          <Navigation className="h-5 w-5" />
          <span>{loading ? 'Finding Route...' : 'Find Best Route'}</span>
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Validation Message */}
      {(!selectedStartLocation || !selectedEndLocation) && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            {!selectedStartLocation && !selectedEndLocation 
              ? "Please select both starting point and destination"
              : !selectedStartLocation 
              ? "Please select a starting point"
              : "Please select a destination"
            }
          </p>
        </div>
      )}
    </div>
  );
}
