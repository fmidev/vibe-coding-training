/**
 * Type definitions for weather data visualization
 */

export interface WeatherParameter {
  type: 'Temperature' | 'SnowDepth' | 'Precipitation1h';
  label: string;
  unit: string;
  colorScale: string[];
}

export interface CoverageJSONData {
  type: string;
  domain: {
    type: string;
    axes: {
      x: { values: number[] };
      y: { values: number[] };
      t?: { values: string[] };
      [key: string]: unknown;
    };
  };
  parameters: {
    [key: string]: {
      description?: { en?: string; fi?: string };
      unit?: {
        label?: { en?: string; fi?: string };
        symbol?: {
          type?: string;
          value?: string;
        } | string;
      };
      observedProperty?: {
        id?: string;
        label?: { en?: string; fi?: string };
      };
    };
  };
  ranges: {
    [key: string]: {
      type: string;
      dataType: string;
      axisNames: string[];
      shape: number[];
      values: number[];
    };
  };
}

export interface WeatherDataPoint {
  lat: number;
  lon: number;
  value: number;
  color: string;
}
