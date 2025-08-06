'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { RouteData, Coordinate } from '../types/route';
import './map.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, isStart: boolean = false, isEnd: boolean = false) => {
  const iconHtml = isStart 
    ? '🚀' 
    : isEnd 
    ? '🏁' 
    : '📍';
    
  return L.divIcon({
    html: `<div class="custom-marker-icon" style="background-color: ${color};">${iconHtml}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const startIcon = createCustomIcon('#10b981', true);
const endIcon = createCustomIcon('#ef4444', false, true);

interface MapViewProps {
  center: [number, number];
  zoom: number;
  route?: RouteData;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Component to fit map bounds to route
function MapBounds({ route }: { route?: RouteData | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.path_coordinates.length > 0) {
      const bounds = L.latLngBounds(
        route.path_coordinates.map(coord => [coord.lat, coord.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [route, map]);
  
  return null;
}

interface RouteMapProps {
  route?: RouteData | null;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  selectedLocation?: 'start' | 'end' | null;
}

export default function RouteMap({ 
  route, 
  onMapClick, 
  height = '400px',
  selectedLocation 
}: RouteMapProps) {
  const mapRef = useRef<L.Map>(null);
  
  // Default center (campus location)
  const defaultCenter: [number, number] = [28.525237, 77.570965];
  const center = route 
    ? [route.start.lat, route.start.lng] as [number, number]
    : defaultCenter;

  // Create polyline coordinates from route
  const polylineCoords = route?.path_coordinates.map(coord => 
    [coord.lat, coord.lng] as [number, number]
  ) || [];

  return (
    <div className="map-container relative w-full h-full">
      <MapContainer
        center={center}
        zoom={16}
        className="map-inner w-full h-full"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        attributionControl={true}
        preferCanvas={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map click handler */}
        <MapClickHandler onMapClick={onMapClick} />
        
        {/* Route polyline */}
        {route && polylineCoords.length > 0 && (
          <Polyline
            positions={polylineCoords}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
          />
        )}
        
        {/* Start marker */}
        {route && (
          <Marker
            position={[route.start.lat, route.start.lng]}
            icon={startIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-green-600">Start Point</strong>
                <br />
                {route.start.lat.toFixed(6)}, {route.start.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* End marker */}
        {route && (
          <Marker
            position={[route.end.lat, route.end.lng]}
            icon={endIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-red-600">Destination</strong>
                <br />
                {route.end.lat.toFixed(6)}, {route.end.lng.toFixed(6)}
                <br />
                <span className="text-gray-600">
                  Distance: {route.total_distance}m ({route.estimated_time_minutes} min)
                </span>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Auto-fit bounds when route changes */}
        <MapBounds route={route} />
      </MapContainer>
      
      {/* Click instruction overlay */}
      {onMapClick && !route && (
        <div className="map-overlay-top">
          <p className="text-sm text-gray-700 text-center">
            {selectedLocation === 'start' && '📍 Tap on the map to set your starting location'}
            {selectedLocation === 'end' && '🎯 Tap on the map to set your destination'}
            {!selectedLocation && '🗺️ Tap on the map to set coordinates'}
          </p>
        </div>
      )}
      
      {/* Route info overlay */}
      {route && (
        <div className="map-overlay-info">
          <div className="text-sm space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📏</span>
              <span className="font-medium">{route.total_distance}m</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-600">⏱️</span>
              <span className="font-medium">{route.estimated_time_minutes} min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
