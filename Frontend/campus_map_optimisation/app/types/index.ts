// Re-export all types for easier imports
export * from './route';
export * from './location';

// Additional types for the main app
export interface LocationPoint {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface RouteData {
  total_distance: number;
  estimated_time_minutes: number;
  navigation_instructions: Array<{
    instruction: string;
    distance?: number;
    distance_text?: string;
  }>;
  path_coordinates: Array<{
    lat: number;
    lng: number;
  }>;
  start?: {
    lat: number;
    lng: number;
  };
  end?: {
    lat: number;
    lng: number;
  };
}
