/**
 * Weather data types for the application
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  name: string;
  coordinates: Coordinates;
}

export interface WeatherData {
  temperature: number;
  weatherSymbol: number;
  windSpeed: number;
  humidity: number;
  cloudCover: number;
  timestamp: string;
}

export interface ForecastDay {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  weatherSymbol: number;
}

export interface CoverageJSONResponse {
  type: string;
  domain: {
    axes: {
      t: { values: string[] };
      [key: string]: unknown;
    };
  };
  parameters: {
    [key: string]: {
      description?: { fi?: string };
      unit?: {
        label?: { fi?: string };
        symbol?:
          | {
              type?: string;
              value?: string;
            }
          | string;
      };
      observedProperty?: {
        id?: string;
        label?: { fi?: string };
      };
    };
  };
  ranges: {
    [key: string]: {
      values: number[];
    };
  };
}

// Predefined locations
export const LOCATIONS: Location[] = [
  { name: 'Helsinki', coordinates: { latitude: 60.1699, longitude: 24.9384 } },
  { name: 'Tampere', coordinates: { latitude: 61.4978, longitude: 23.7610 } },
  { name: 'Turku', coordinates: { latitude: 60.4518, longitude: 22.2666 } },
  { name: 'Oulu', coordinates: { latitude: 65.0121, longitude: 25.4651 } },
  { name: 'Rovaniemi', coordinates: { latitude: 66.5039, longitude: 25.7294 } },
];
