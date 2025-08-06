export interface Instruction {
  instruction: string;
  distance: number;
  distance_text: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteData {
  start: Coordinate;
  end: Coordinate;
  total_distance: number;
  estimated_time_minutes: number;
  instructions: Instruction[];
  path_coordinates: Coordinate[];
}

export interface RouteResponse {
  success: boolean;
  route?: RouteData;
  error?: string;
}

export interface RouteFormData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}
