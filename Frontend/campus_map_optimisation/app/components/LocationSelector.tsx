'use client';

import { useState } from 'react';
import { Location, LocationCategory } from '../types/location';
import locationData from '../data/locations.json';

interface LocationSelectorProps {
  value?: Location | null;
  onChange: (location: Location | null) => void;
  placeholder?: string;
  allowCurrentLocation?: boolean;
  excludeLocationId?: string;
}

export default function LocationSelector({
  value,
  onChange,
  placeholder = "Select a location",
  allowCurrentLocation = false,
  excludeLocationId
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const locations = locationData.locations.filter(location => 
    location.id !== excludeLocationId
  );

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedLocations = locationData.categories.reduce((acc, category) => {
    acc[category] = filteredLocations.filter(loc => loc.category === category);
    return acc;
  }, {} as Record<string, Location[]>);

  const handleLocationSelect = (location: Location) => {
    onChange(location);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLoc: Location = {
            id: 'current',
            name: 'Current Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            category: 'Current',
            description: 'Your current GPS location'
          };
          onChange(currentLoc);
          setIsOpen(false);
        },
        (error) => {
          alert('Unable to get your current location. Please select from the list.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="relative">
      {/* Selected value display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
      >
        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-gray-900 block truncate">{value.name}</span>
              <div className="text-sm text-gray-500 truncate mt-1">{value.description}</div>
            </div>
            <span className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 ml-3 shrink-0">
              {value.category}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 font-medium">{placeholder}</span>
        )}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25 sm:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden backdrop-blur-sm animate-in slide-in-from-top-2 duration-200 sm:relative sm:z-50">
            {/* Search and filter header */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-400 touch-manipulation"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer touch-manipulation"
                  aria-label="Filter locations by category"
                >
                  <option value="all">All Categories</option>
                  {locationData.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Current location option */}
            {allowCurrentLocation && (
              <div className="border-b border-gray-100">
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  className="w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 focus:outline-none focus:bg-blue-50 transition-all duration-200 group touch-manipulation"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <span className="text-white text-lg">📍</span>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600 group-hover:text-blue-700">Use Current Location</div>
                      <div className="text-sm text-gray-500">Get your GPS coordinates automatically</div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Location list */}
            <div className="max-h-64 overflow-y-auto">
              {Object.entries(groupedLocations).map(([category, categoryLocations]) => (
                categoryLocations.length > 0 && (
                  <div key={category}>
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-sm font-semibold text-gray-700 border-b border-gray-100 sticky top-0 z-10">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">
                          {category === 'Academic' && '🎓'}
                          {category === 'Administrative' && '🏢'}
                          {category === 'Dining' && '🍽️'}
                          {category === 'Events' && '🎭'}
                          {category === 'Accommodation' && '🏠'}
                          {category === 'Recreation' && '⚽'}
                          {category === 'Healthcare' && '🏥'}
                          {category === 'Parking' && '🚗'}
                          {category === 'Entry' && '🚪'}
                          {category === 'Research' && '🔬'}
                        </span>
                        <span>{category}</span>
                      </div>
                    </div>
                    {categoryLocations.map((location, index) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className="w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 focus:outline-none focus:bg-blue-50 border-b border-gray-50 last:border-b-0 transition-all duration-200 group touch-manipulation"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
                              {location.name}
                            </div>
                            <div className="text-sm text-gray-500 group-hover:text-gray-600 mt-1 truncate">
                              {location.description}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 font-mono">
                              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </div>
                          </div>
                          <div className="ml-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200">
                              <span className="text-sm">
                                {category === 'Academic' && '🎓'}
                                {category === 'Administrative' && '🏢'}
                                {category === 'Dining' && '🍽️'}
                                {category === 'Events' && '🎭'}
                                {category === 'Accommodation' && '🏠'}
                                {category === 'Recreation' && '⚽'}
                                {category === 'Healthcare' && '🏥'}
                                {category === 'Parking' && '🚗'}
                                {category === 'Entry' && '🚪'}
                                {category === 'Research' && '🔬'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ))}
            </div>

            {/* No results */}
            {filteredLocations.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <div className="font-semibold text-gray-700 mb-2">No locations found</div>
                <div className="text-sm text-gray-500">Try adjusting your search terms or filter settings</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-all duration-200 group touch-manipulation"
          aria-label="Clear selected location"
          title="Clear selection"
        >
          <svg className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
