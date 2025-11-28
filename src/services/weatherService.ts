/**
 * Weather service for fetching current weather and forecast data
 */

import { getPositionData } from './edrApi';
import type { CoverageJSONResponse } from '../types/weather';
import { calculateWeatherSymbolFromCloudCover, formatCoordinates } from '../utils/weatherUtils';

const DEFAULT_CLOUD_COVER = 50;

export interface CurrentWeather {
  temperature: number;
  weatherSymbol: number;
  windSpeed?: number;
  humidity?: number;
  cloudCover?: number;
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  weatherSymbol: number;
}

/**
 * Fetch current weather for a location
 */
export const fetchCurrentWeather = async (
  latitude: number,
  longitude: number
): Promise<CurrentWeather> => {
  const coords = formatCoordinates(latitude, longitude);
  
  // Get current time and 1 hour ahead
  const now = new Date();
  const future = new Date(now.getTime() + 60 * 60 * 1000);
  const datetime = `${now.toISOString()}/${future.toISOString()}`;
  
  const data = await getPositionData('pal_skandinavia', coords, {
    f: 'CoverageJSON',
    'parameter-name': 'Temperature,WindSpeedMS,Humidity,TotalCloudCover',
    datetime,
  }) as CoverageJSONResponse;
  
  // Extract the first time step (current)
  const firstTimeIndex = 0;
  const temperature = data.ranges.Temperature?.values[firstTimeIndex] ?? 0;
  const windSpeed = data.ranges.WindSpeedMS?.values[firstTimeIndex];
  const humidity = data.ranges.Humidity?.values[firstTimeIndex];
  const cloudCover = data.ranges.TotalCloudCover?.values[firstTimeIndex];
  
  // Calculate weather symbol from cloud cover
  const weatherSymbol = cloudCover !== undefined 
    ? calculateWeatherSymbolFromCloudCover(cloudCover)
    : 1;
  
  return {
    temperature,
    weatherSymbol,
    windSpeed,
    humidity,
    cloudCover,
    timestamp: data.domain.axes.t.values[firstTimeIndex],
  };
};

/**
 * Fetch 7-day forecast for a location
 */
export const fetch7DayForecast = async (
  latitude: number,
  longitude: number
): Promise<DailyForecast[]> => {
  const coords = formatCoordinates(latitude, longitude);
  
  // Get 7 days of data (8 days to ensure we have complete data)
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start from midnight
  const future = new Date(now);
  future.setDate(future.getDate() + 8);
  
  const datetime = `${now.toISOString()}/${future.toISOString()}`;
  
  const data = await getPositionData('pal_skandinavia', coords, {
    f: 'CoverageJSON',
    'parameter-name': 'Temperature,TotalCloudCover',
    datetime,
  }) as CoverageJSONResponse;
  
  // Group data by day
  const dailyData: Map<string, number[]> = new Map();
  const dailyCloudCover: Map<string, number[]> = new Map();
  
  data.domain.axes.t.values.forEach((timestamp, index) => {
    const date = new Date(timestamp);
    const dateKey = date.toISOString().split('T')[0];
    
    const temp = data.ranges.Temperature?.values[index];
    const cloud = data.ranges.TotalCloudCover?.values[index];
    
    if (temp !== undefined) {
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, []);
      }
      dailyData.get(dateKey)!.push(temp);
    }
    
    if (cloud !== undefined) {
      if (!dailyCloudCover.has(dateKey)) {
        dailyCloudCover.set(dateKey, []);
      }
      dailyCloudCover.get(dateKey)!.push(cloud);
    }
  });
  
  // Calculate daily summaries
  const forecasts: DailyForecast[] = [];
  
  Array.from(dailyData.keys())
    .sort()
    .slice(0, 7)
    .forEach((dateKey) => {
      const temps = dailyData.get(dateKey) || [];
      const clouds = dailyCloudCover.get(dateKey) || [];
      
      if (temps.length > 0) {
        const min = Math.min(...temps);
        const max = Math.max(...temps);
        const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
        
        // Calculate average cloud cover for the day
        const avgCloud = clouds.length > 0
          ? clouds.reduce((a, b) => a + b, 0) / clouds.length
          : DEFAULT_CLOUD_COVER;
        
        const weatherSymbol = calculateWeatherSymbolFromCloudCover(avgCloud);
        
        forecasts.push({
          date: dateKey,
          temperature: { min, max, avg },
          weatherSymbol,
        });
      }
    });
  
  return forecasts;
};
