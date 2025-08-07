'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { RouteData, Coordinate } from '../types/route';
import { useLocation } from '../contexts/LocationContext';
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

// User location marker with direction indicator
const createUserLocationIcon = (heading?: number) => {
  const rotation = heading ? `transform: rotate(${heading}deg);` : '';
  const iconHtml = `
    <div class="user-location-marker" style="${rotation}">
      <div class="user-location-dot"></div>
      ${heading !== undefined ? '<div class="user-direction-arrow">▲</div>' : ''}
    </div>
  `;
    
  return L.divIcon({
    html: iconHtml,
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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

// Component to fit map bounds to route or user location
function MapBounds({ route, userLocation, isNavigating }: { 
  route?: RouteData | null; 
  userLocation?: { lat: number; lng: number } | null;
  isNavigating?: boolean;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (isNavigating && userLocation) {
      // During navigation, center on user location
      map.setView([userLocation.lat, userLocation.lng], 18, { animate: true });
    } else if (route && route.path_coordinates.length > 0) {
      // When showing route, fit to route bounds
      const bounds = L.latLngBounds(
        route.path_coordinates.map(coord => [coord.lat, coord.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [route, userLocation, isNavigating, map]);
  
  return null;
}

interface RouteMapProps {
  route?: RouteData | null;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  selectedLocation?: 'start' | 'end' | null;
  isNavigating?: boolean;
  showUserLocation?: boolean;
}

export default function RouteMap({ 
  route, 
  onMapClick, 
  height = '400px',
  selectedLocation,
  isNavigating = false,
  showUserLocation = true
}: RouteMapProps) {
  const mapRef = useRef<L.Map>(null);
  const { currentLocation, isTracking } = useLocation();
  
  // Default center (campus location)
  const defaultCenter: [number, number] = [28.525237, 77.570965];
  const center = currentLocation && isNavigating
    ? [currentLocation.latitude, currentLocation.longitude] as [number, number]
    : route && route.start
    ? [route.start.lat, route.start.lng] as [number, number]
    : defaultCenter;

  // Create polyline coordinates from route
  const polylineCoords = route?.path_coordinates.map(coord => 
    [coord.lat, coord.lng] as [number, number]
  ) || [];

  const userLocationIcon = currentLocation?.heading 
    ? createUserLocationIcon(currentLocation.heading)
    : createUserLocationIcon();

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
            weight={6}
            opacity={0.8}
          />
        )}

        {/* User location marker and accuracy circle */}
        {showUserLocation && currentLocation && isTracking && (
          <>
            <Circle
              center={[currentLocation.latitude, currentLocation.longitude]}
              radius={currentLocation.accuracy}
              fillColor="#3b82f6"
              fillOpacity={0.1}
              color="#3b82f6"
              weight={1}
              opacity={0.3}
            />
            <Marker
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="text-blue-600">Your Location</strong>
                  <br />
                  Accuracy: ±{Math.round(currentLocation.accuracy)}m
                  {currentLocation.speed && (
                    <>
                      <br />
                      Speed: {Math.round(currentLocation.speed * 3.6)} km/h
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}
        
        {/* Start marker */}
        {route && route.start && (
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
        {route && route.end && (
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
        <MapBounds 
          route={route} 
          userLocation={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null}
          isNavigating={isNavigating}
        />
      </MapContainer>
      
    </div>
  );
}
