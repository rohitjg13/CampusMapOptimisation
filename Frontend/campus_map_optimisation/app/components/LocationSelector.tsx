'use client';

import { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const locations = locationData.locations.filter(location => 
    location.id !== excludeLocationId
  );

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

    // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Academic': '🎓',
      'Administrative': '🏢',
      'Dining': '🍽️',
      'Events': '🎭',
      'Accommodation': '🏠',
      'Recreation': '⚽',
      'Healthcare': '🏥',
      'Parking': '🚗',
      'Entry': '🚪',
      'Research': '🔬',
      'Current': '📍'
    };
    return icons[category] || '📍';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 active:scale-[0.98]"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {value ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{getCategoryIcon(value.category)}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900 truncate">{value.name}</p>
                <p className="text-sm text-gray-500 truncate">{value.description}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📍</span>
              </div>
              <p className="font-medium text-gray-400">{placeholder}</p>
            </>
          )}
        </div>
        <div className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Mobile-First Dropdown */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden md:w-full">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Current Location Option */}
            {allowCurrentLocation && (
              <div className="p-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 focus:bg-blue-50 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📍</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-blue-600">Use Current Location</p>
                    <p className="text-sm text-gray-500">Get your GPS coordinates</p>
                  </div>
                </button>
              </div>
            )}

            {/* Locations List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                <div className="p-2">
                  {filteredLocations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => handleLocationSelect(location)}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 focus:bg-gray-50 transition-colors active:scale-[0.98] mb-1"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <span className="text-lg">{getCategoryIcon(location.category)}</span>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{location.name}</p>
                        <p className="text-sm text-gray-500 truncate">{location.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {location.category}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="font-semibold text-gray-700 mb-2">No locations found</p>
                  <p className="text-sm text-gray-500">Try searching with different terms</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-14 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors group"
          aria-label="Clear selected location"
        >
          <svg className="w-3 h-3 text-gray-500 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
