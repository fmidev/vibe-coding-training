/**
 * Weather data type definitions for OGC EDR API responses
 */

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

export interface WeatherData {
  temperature?: number;
  windSpeedMS?: number;
  windDirection?: number;
  precipitation1h?: number;
  pop?: number; // Probability of precipitation
  hourlyTemperatures?: { time: string; temperature: number }[];
}

export const extractWeatherData = (
  response: CoverageJSONResponse,
  hourlyCount: number = 12
): WeatherData => {
  const timeValues = response.domain.axes.t.values;
  const ranges = response.ranges;

  // Get current weather (first time step)
  const currentData: WeatherData = {};

  if (ranges.Temperature?.values?.[0] !== undefined) {
    currentData.temperature = ranges.Temperature.values[0];
  }

  if (ranges.WindSpeedMS?.values?.[0] !== undefined) {
    currentData.windSpeedMS = ranges.WindSpeedMS.values[0];
  }

  if (ranges.WindDirection?.values?.[0] !== undefined) {
    currentData.windDirection = ranges.WindDirection.values[0];
  }

  if (ranges.Precipitation1h?.values?.[0] !== undefined) {
    currentData.precipitation1h = ranges.Precipitation1h.values[0];
  }

  if (ranges.PoP?.values?.[0] !== undefined) {
    currentData.pop = ranges.PoP.values[0];
  }

  // Extract hourly temperatures
  if (ranges.Temperature?.values && timeValues) {
    currentData.hourlyTemperatures = timeValues
      .slice(0, hourlyCount)
      .map((time, index) => ({
        time,
        temperature: ranges.Temperature.values[index],
      }))
      .filter((item) => item.temperature !== undefined);
  }

  return currentData;
};
