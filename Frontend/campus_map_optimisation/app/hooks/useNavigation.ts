'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { RouteData } from '../types/route';

interface NavigationState {
  currentRoute: RouteData | null;
  isNavigating: boolean;
  distanceToRoute: number;
  nextInstruction: any;
  routeProgress: number;
  shouldRecalculate: boolean;
}

interface UseNavigationProps {
  destination: { lat: number; lng: number } | null;
  maxDistanceFromRoute?: number; // meters
  recalculationThreshold?: number; // meters
}

// Simple distance calculation between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate distance from a point to a line segment
function distanceToLineSegment(
  pointLat: number,
  pointLng: number,
  line1Lat: number,
  line1Lng: number,
  line2Lat: number,
  line2Lng: number
): number {
  const A = pointLat - line1Lat;
  const B = pointLng - line1Lng;
  const C = line2Lat - line1Lat;
  const D = line2Lng - line1Lng;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return calculateDistance(pointLat, pointLng, line1Lat, line1Lng);
  }

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const xx = line1Lat + param * C;
  const yy = line1Lng + param * D;

  return calculateDistance(pointLat, pointLng, xx, yy);
}

// Route cache
const routeCache = new Map<string, { route: RouteData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useNavigation({
  destination,
  maxDistanceFromRoute = 50,
  recalculationThreshold = 25
}: UseNavigationProps) {
  const { currentLocation, isTracking } = useLocation();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentRoute: null,
    isNavigating: false,
    distanceToRoute: 0,
    nextInstruction: null,
    routeProgress: 0,
    shouldRecalculate: false,
  });

  const [routeCalculationInProgress, setRouteCalculationInProgress] = useState(false);

  // Generate cache key for route
  const generateCacheKey = useCallback((start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    return `${start.lat.toFixed(4)},${start.lng.toFixed(4)}-${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
  }, []);

  // Get route from cache or API
  const getRoute = useCallback(async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    const cacheKey = generateCacheKey(start, end);
    const cached = routeCache.get(cacheKey);
    
    // Check if cached route is still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.route;
    }

    // Fetch new route
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${apiUrl}/route?start_lat=${start.lat}&start_lng=${start.lng}&end_lat=${end.lat}&end_lng=${end.lng}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Cache the route
        routeCache.set(cacheKey, {
          route: data.route,
          timestamp: Date.now()
        });
        return data.route;
      } else {
        throw new Error(data.error || 'Failed to calculate route');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      throw error;
    }
  }, [generateCacheKey]);

  // Calculate distance from current location to route path
  const distanceToCurrentRoute = useMemo(() => {
    if (!currentLocation || !navigationState.currentRoute) {
      return 0;
    }

    const route = navigationState.currentRoute;
    const coords = route.path_coordinates;
    
    if (coords.length < 2) {
      return 0;
    }

    let minDistance = Infinity;
    
    // Check distance to each segment of the route
    for (let i = 0; i < coords.length - 1; i++) {
      const distance = distanceToLineSegment(
        currentLocation.latitude,
        currentLocation.longitude,
        coords[i].lat,
        coords[i].lng,
        coords[i + 1].lat,
        coords[i + 1].lng
      );
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }, [currentLocation, navigationState.currentRoute]);

  // Calculate route progress and next instruction
  const routeProgress = useMemo(() => {
    if (!currentLocation || !navigationState.currentRoute) {
      return { progress: 0, nextInstruction: null, distanceToNext: 0 };
    }

    const route = navigationState.currentRoute;
    const coords = route.path_coordinates;
    
    if (coords.length < 2) {
      return { progress: 0, nextInstruction: null, distanceToNext: 0 };
    }

    // Find closest point on route
    let closestSegmentIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < coords.length - 1; i++) {
      const distance = distanceToLineSegment(
        currentLocation.latitude,
        currentLocation.longitude,
        coords[i].lat,
        coords[i].lng,
        coords[i + 1].lat,
        coords[i + 1].lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSegmentIndex = i;
      }
    }

    // Calculate progress as percentage
    const totalSegments = coords.length - 1;
    const progress = Math.min(100, (closestSegmentIndex / totalSegments) * 100);

    // Get next instruction
    const instructions = route.instructions || [];
    let nextInstruction = null;
    let distanceToNext = 0;

    // Find the next instruction after current position
    for (let i = closestSegmentIndex; i < instructions.length; i++) {
      if (instructions[i]) {
        nextInstruction = instructions[i];
        // Calculate distance to next instruction point (simplified)
        if (i < coords.length) {
          distanceToNext = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            coords[i].lat,
            coords[i].lng
          );
        }
        break;
      }
    }

    return { progress, nextInstruction, distanceToNext };
  }, [currentLocation, navigationState.currentRoute]);

  // Start navigation
  const startNavigation = useCallback(async () => {
    if (!currentLocation || !destination) {
      return;
    }

    setRouteCalculationInProgress(true);

    try {
      const route = await getRoute(
        { lat: currentLocation.latitude, lng: currentLocation.longitude },
        destination
      );

      setNavigationState(prev => ({
        ...prev,
        currentRoute: route,
        isNavigating: true,
        shouldRecalculate: false,
      }));
    } catch (error) {
      console.error('Failed to start navigation:', error);
    } finally {
      setRouteCalculationInProgress(false);
    }
  }, [currentLocation, destination, getRoute]);

  // Stop navigation
  const stopNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      currentRoute: null,
      isNavigating: false,
      distanceToRoute: 0,
      nextInstruction: null,
      routeProgress: 0,
      shouldRecalculate: false,
    }));
  }, []);

  // Recalculate route when user deviates
  const recalculateRoute = useCallback(async () => {
    if (!currentLocation || !destination || routeCalculationInProgress) {
      return;
    }

    setRouteCalculationInProgress(true);

    try {
      const newRoute = await getRoute(
        { lat: currentLocation.latitude, lng: currentLocation.longitude },
        destination
      );

      setNavigationState(prev => ({
        ...prev,
        currentRoute: newRoute,
        shouldRecalculate: false,
      }));
    } catch (error) {
      console.error('Failed to recalculate route:', error);
    } finally {
      setRouteCalculationInProgress(false);
    }
  }, [currentLocation, destination, getRoute, routeCalculationInProgress]);

  // Monitor location and update navigation state
  useEffect(() => {
    if (!navigationState.isNavigating || !currentLocation) {
      return;
    }

    const distanceToRoute = distanceToCurrentRoute;
    const shouldRecalculate = distanceToRoute > recalculationThreshold;

    setNavigationState(prev => ({
      ...prev,
      distanceToRoute,
      nextInstruction: routeProgress.nextInstruction,
      routeProgress: routeProgress.progress,
      shouldRecalculate,
    }));

    // Auto-recalculate if user is too far from route
    if (shouldRecalculate && !routeCalculationInProgress) {
      console.log(`User is ${distanceToRoute.toFixed(1)}m from route, recalculating...`);
      recalculateRoute();
    }
  }, [currentLocation, navigationState.isNavigating, distanceToCurrentRoute, routeProgress, recalculationThreshold, recalculateRoute, routeCalculationInProgress]);

  return {
    ...navigationState,
    currentLocation,
    isTracking,
    routeProgress: routeProgress.progress,
    nextInstruction: routeProgress.nextInstruction,
    distanceToNextInstruction: routeProgress.distanceToNext,
    startNavigation,
    stopNavigation,
    recalculateRoute,
    isRecalculating: routeCalculationInProgress,
  };
}
