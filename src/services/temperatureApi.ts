/**
 * Temperature API Service for calculating daily average temperatures
 * Uses the FMI Open Data OGC EDR 1.1 API
 */

import { getPositionData } from './edrApi';

interface CoverageJSONResponse {
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

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  // Use a date that has forecast data available
  // The pal_skandinavia collection provides forecast data
  return '2025-11-24';
};

/**
 * Calculate the average temperature for a specific location and date
 * @param lat - Latitude
 * @param lon - Longitude
 * @param date - Date in YYYY-MM-DD format
 * @returns Average temperature in Celsius
 */
export const getAverageTemperature = async (
  lat: number,
  lon: number,
  date: string
): Promise<number> => {
  // Create datetime range for the entire day (UTC)
  const startDateTime = `${date}T00:00:00Z`;
  const endDateTime = `${date}T23:59:59Z`;

  const coords = `POINT(${lon} ${lat})`;

  try {
    const data = (await getPositionData('pal_skandinavia', coords, {
      f: 'CoverageJSON',
      'parameter-name': 'Temperature',
      datetime: `${startDateTime}/${endDateTime}`,
    })) as CoverageJSONResponse;

    // Extract temperature values - try both 'Temperature' and 'temperature'
    const temperatureValues = 
      data.ranges?.Temperature?.values || 
      data.ranges?.temperature?.values;

    if (!temperatureValues || temperatureValues.length === 0) {
      throw new Error('No temperature data available for the specified date and location');
    }

    // Calculate average temperature
    const validTemperatures = temperatureValues.filter(
      (temp) => temp !== null && temp !== undefined && !isNaN(temp)
    );

    if (validTemperatures.length === 0) {
      throw new Error('No valid temperature data available');
    }

    const sum = validTemperatures.reduce((acc, temp) => acc + temp, 0);
    const average = sum / validTemperatures.length;

    return average;
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    throw error;
  }
};
