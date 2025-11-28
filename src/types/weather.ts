export interface WeatherData {
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
        symbol?: {
          type?: string;
          value?: string;
        } | string;
      };
      observedProperty?: {
        id?: string;
        label?: { fi?: string };
      };
    };
  };
  ranges: {
    [key: string]: {
      values: (number | null)[];
    };
  };
}

export interface WeatherDataPoint {
  time: string;
  timestamp: number;
  temperature: number | null;
  windSpeed: number | null;
  weatherSymbol: number | null;
}
