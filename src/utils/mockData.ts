/**
 * Mock weather data for testing and development
 */

import type { CoverageJSONResponse } from '../types/weather';

export const getMockWeatherData = (): CoverageJSONResponse => {
  const now = new Date();
  const timeValues: string[] = [];
  
  // Generate 12 hours of timestamps
  for (let i = 0; i < 12; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    timeValues.push(time.toISOString());
  }

  return {
    type: 'Coverage',
    domain: {
      axes: {
        t: { values: timeValues },
      },
    },
    parameters: {
      Temperature: {
        description: { fi: 'Lämpötila' },
        unit: {
          label: { fi: 'Celsius' },
          symbol: '°C',
        },
      },
      WindSpeedMS: {
        description: { fi: 'Tuulen nopeus' },
        unit: {
          label: { fi: 'metri per sekunti' },
          symbol: 'm/s',
        },
      },
      WindDirection: {
        description: { fi: 'Tuulen suunta' },
        unit: {
          label: { fi: 'astetta' },
          symbol: '°',
        },
      },
      Precipitation1h: {
        description: { fi: 'Sademäärä 1h' },
        unit: {
          label: { fi: 'millimetri' },
          symbol: 'mm',
        },
      },
      PoP: {
        description: { fi: 'Sateen todennäköisyys' },
        unit: {
          label: { fi: 'prosentti' },
          symbol: '%',
        },
      },
    },
    ranges: {
      Temperature: {
        values: [5.2, 4.8, 4.5, 4.2, 4.0, 4.1, 4.5, 5.0, 5.8, 6.5, 7.2, 7.8],
      },
      WindSpeedMS: {
        values: [3.5, 3.8, 4.1, 4.2, 4.0, 3.8, 3.5, 3.2, 3.0, 2.8, 2.5, 2.3],
      },
      WindDirection: {
        values: [225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280],
      },
      Precipitation1h: {
        values: [0.1, 0.2, 0.3, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0],
      },
      PoP: {
        values: [25, 30, 35, 45, 40, 35, 30, 25, 20, 15, 10, 10],
      },
    },
  };
};
