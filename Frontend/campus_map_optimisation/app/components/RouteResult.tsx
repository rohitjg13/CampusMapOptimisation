'use client';

import { RouteData } from '../types/route';
import { Clock, MapPin, Route, RotateCcw, Navigation, ArrowRight, PlayCircle, StopCircle } from 'lucide-react';

interface RouteResultProps {
  route?: RouteData;
  routeData?: RouteData;
  onReset?: () => void;
  onStartNavigation?: () => void;
  isNavigationMode?: boolean;
}

export default function RouteResult({ route, routeData, onReset, onStartNavigation, isNavigationMode }: RouteResultProps) {
  // Use either route or routeData for backward compatibility
  const data = route || routeData;
  
  if (!data) return null;

  const formatCoordinate = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance} m`;
  };

  const getInstructionIcon = (instruction: string) => {
    const text = instruction.toLowerCase();
    if (text.includes('left')) {
      return '↰';
    } else if (text.includes('right')) {
      return '↱';
    } else if (text.includes('straight') || text.includes('continue')) {
      return '↑';
    } else if (text.includes('u-turn')) {
      return '↶';
    } else if (text.includes('start')) {
      return '🚀';
    } else if (text.includes('arrived') || text.includes('destination')) {
      return '🏁';
    }
    return '→';
  };

  // Handle different instruction formats
  const instructions = data.instructions || (data as any).navigation_instructions || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Route className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Route Found!</h3>
              <p className="text-sm text-gray-600">Your navigation is ready</p>
            </div>
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title="Plan new route"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Route Summary */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Route className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Distance</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDistance(data.total_distance)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Estimated Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {data.estimated_time_minutes} min
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Navigation className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Steps</p>
              <p className="text-lg font-semibold text-gray-900">
                {instructions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Navigation Button */}
      {onStartNavigation && (
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={onStartNavigation}
            disabled={isNavigationMode}
            className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              isNavigationMode
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isNavigationMode ? (
              <>
                <StopCircle className="h-5 w-5" />
                <span>Navigation Active</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                <span>Start Live Navigation</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Start and End Points */}
      {data.start && data.end && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-1.5 rounded-full mt-0.5">
                <MapPin className="h-3 w-3 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Starting Point</p>
                <p className="text-xs text-gray-600 font-mono">
                  {formatCoordinate(data.start.lat, data.start.lng)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 p-1.5 rounded-full mt-0.5">
                <MapPin className="h-3 w-3 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Destination</p>
                <p className="text-xs text-gray-600 font-mono">
                  {formatCoordinate(data.end.lat, data.end.lng)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Turn-by-Turn Instructions */}
      {instructions.length > 0 && (
        <div className="px-6 py-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Navigation className="h-4 w-4 text-blue-600" />
            <span>Turn-by-Turn Directions</span>
          </h4>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {instructions.map((instruction, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  index === 0
                    ? 'bg-green-50 border border-green-200'
                    : index === instructions.length - 1
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-green-200 text-green-800'
                        : index === instructions.length - 1
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-xs">
                      {getInstructionIcon(instruction.instruction)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {instruction.instruction}
                      </p>
                      {instruction.distance_text && (
                        <p className="text-xs text-gray-600 mt-1">
                          {instruction.distance_text}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      {onReset && !onStartNavigation && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onReset}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
            >
              <Route className="h-4 w-4" />
              <span>Plan New Route</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
