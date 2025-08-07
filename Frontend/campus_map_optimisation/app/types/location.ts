export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  description: string;
}

export interface LocationData {
  locations: Location[];
  categories: string[];
}

export type LocationCategory = 
  | "Academic"
  | "Administrative" 
  | "Dining"
  | "Events"
  | "Accommodation"
  | "Recreation"
  | "Healthcare"
  | "Parking"
  | "Entry"
  | "Research"
  | "Shopping"  // Added
  | "Services";   // Added