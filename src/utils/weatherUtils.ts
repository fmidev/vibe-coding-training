/**
 * Weather symbol mapping utilities
 * Based on FMI weather symbol codes
 */

import {
  WbSunny,
  Cloud,
  CloudQueue,
  Grain,
  AcUnit,
  Thunderstorm,
  FilterDrama,
} from '@mui/icons-material';

export interface WeatherSymbolInfo {
  icon: typeof WbSunny;
  description: string;
  color: string;
}

/**
 * Map FMI weather symbol codes to Material UI icons and descriptions
 * FMI uses symbols 1-99 with various meanings
 */
export const getWeatherSymbol = (symbolCode: number): WeatherSymbolInfo => {
  // Simplified mapping based on common FMI symbols
  if (symbolCode === 1) {
    return { icon: WbSunny, description: 'Clear', color: '#FDB813' };
  } else if (symbolCode >= 2 && symbolCode <= 21) {
    return { icon: CloudQueue, description: 'Partly Cloudy', color: '#78909C' };
  } else if (symbolCode >= 22 && symbolCode <= 41) {
    return { icon: Cloud, description: 'Cloudy', color: '#607D8B' };
  } else if (symbolCode >= 42 && symbolCode <= 51) {
    return { icon: FilterDrama, description: 'Foggy', color: '#90A4AE' };
  } else if (symbolCode >= 52 && symbolCode <= 61) {
    return { icon: Grain, description: 'Rainy', color: '#42A5F5' };
  } else if (symbolCode >= 62 && symbolCode <= 71) {
    return { icon: AcUnit, description: 'Snowy', color: '#90CAF9' };
  } else if (symbolCode >= 72 && symbolCode <= 82) {
    return { icon: Grain, description: 'Light Rain', color: '#64B5F6' };
  } else if (symbolCode >= 83 && symbolCode <= 99) {
    return { icon: Thunderstorm, description: 'Thunderstorm', color: '#5C6BC0' };
  }
  
  // Default for unknown symbols
  return { icon: Cloud, description: 'Unknown', color: '#9E9E9E' };
};

/**
 * Get current location using Geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: false,
      });
    }
  });
};

/**
 * Format coordinates for the EDR API
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `POINT(${longitude.toFixed(4)} ${latitude.toFixed(4)})`;
};

/**
 * Calculate weather symbol from cloud cover
 * This is a simplified calculation when actual weather symbol is not available
 */
export const calculateWeatherSymbolFromCloudCover = (cloudCover: number): number => {
  if (cloudCover < 20) return 1; // Clear
  if (cloudCover < 50) return 2; // Partly cloudy
  return 22; // Cloudy
};
