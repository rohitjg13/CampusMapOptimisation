'use client';

import { RouteData } from '../types/route';
import { Navigation, MapPin, Clock, ArrowRight, RotateCcw } from 'lucide-react';

interface RouteDirectionsProps {
  route: RouteData;
  onReset: () => void;
}

export default function RouteDirections({ route, onReset }: RouteDirectionsProps) {
  const getDirectionIcon = (instruction: string) => {
    const lowercaseInstruction = instruction.toLowerCase();
    
    if (lowercaseInstruction.includes('start')) return '🚀';
    if (lowercaseInstruction.includes('arrived') || lowercaseInstruction.includes('destination')) return '🏁';
    if (lowercaseInstruction.includes('right')) return '↗️';
    if (lowercaseInstruction.includes('left')) return '↖️';
    if (lowercaseInstruction.includes('straight') || lowercaseInstruction.includes('continue')) return '⬆️';
    if (lowercaseInstruction.includes('u-turn')) return '↪️';
    return '📍';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Route Directions</h3>
              <p className="text-blue-100 text-sm">
                {route.total_distance}m • {route.estimated_time_minutes} min walk
              </p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            aria-label="Reset route"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Route Summary */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-gray-700">From:</span>
            <span className="text-gray-600 truncate">
              {route.start.lat.toFixed(4)}, {route.start.lng.toFixed(4)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="font-medium text-gray-700">To:</span>
            <span className="text-gray-600 truncate">
              {route.end.lat.toFixed(4)}, {route.end.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Directions List */}
      <div className="max-h-80 overflow-y-auto">
        {route.instructions && route.instructions.length > 0 ? (
          <div className="p-2">
            {route.instructions.map((instruction, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-3 rounded-xl mb-2 transition-colors ${
                  index === 0 ? 'bg-green-50 border border-green-200' :
                  index === route.instructions.length - 1 ? 'bg-red-50 border border-red-200' :
                  'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-green-500 text-white' :
                    index === route.instructions.length - 1 ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {index === 0 ? '🚀' : 
                     index === route.instructions.length - 1 ? '🏁' : 
                     (index + 1).toString()}
                  </div>
                </div>

                {/* Instruction Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm leading-relaxed">
                    {instruction.instruction}
                  </p>
                  {instruction.distance > 0 && (
                    <div className="flex items-center space-x-1 mt-1">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">
                        {instruction.distance}m
                      </span>
                      <span className="text-xs text-gray-400">
                        ({Math.round(instruction.distance / 80)} min)
                      </span>
                    </div>
                  )}
                </div>

                {/* Direction Icon */}
                <div className="flex-shrink-0 text-lg">
                  {getDirectionIcon(instruction.instruction)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Navigation className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-2">No directions available</p>
            <p className="text-sm text-gray-500">Route calculated but no turn-by-turn instructions found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Walking speed: ~80m/min</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{route.instructions?.length || 0} steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
