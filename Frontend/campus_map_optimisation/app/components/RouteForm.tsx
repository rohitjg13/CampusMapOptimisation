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
    <div className="space-y-4">
      {/* Start Location */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">From</h3>
            <p className="text-xs text-gray-500">Starting point</p>
          </div>
        </div>
        <LocationSelector
          value={selectedStartLocation}
          onChange={handleStartLocationChange}
          placeholder="Choose starting location"
          allowCurrentLocation={true}
          excludeLocationId={selectedEndLocation?.id}
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={swapLocations}
          disabled={loading || !selectedStartLocation || !selectedEndLocation}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Swap locations"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* End Location */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">To</h3>
            <p className="text-xs text-gray-500">Destination</p>
          </div>
        </div>
        <LocationSelector
          value={selectedEndLocation}
          onChange={handleEndLocationChange}
          placeholder="Choose destination"
          allowCurrentLocation={false}
          excludeLocationId={selectedStartLocation?.id}
        />
      </div>

      {/* Action Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !selectedStartLocation || !selectedEndLocation}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Finding Route...</span>
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5" />
              <span>Find Route</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* Reset Button */}
      {(selectedStartLocation || selectedEndLocation) && (
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          Reset locations
        </button>
      )}

      {/* Validation Message */}
      {(!selectedStartLocation || !selectedEndLocation) && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            {!selectedStartLocation && !selectedEndLocation 
              ? "Select both locations to find route"
              : !selectedStartLocation 
              ? "Choose a starting point"
              : "Choose a destination"
            }
          </p>
        </div>
      )}
    </div>
  );
}
