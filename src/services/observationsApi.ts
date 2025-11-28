/**
 * FMI Observations API Service
 * Service for fetching real-time weather observations from FMI Open Data
 */

const EDR_BASE_URL = 'https://opendata.fmi.fi/edr';
const OPENDATA_COLLECTION = 'opendata';

// Gulf of Finland weather stations
export interface WeatherStation {
  fmisid: string;
  name: string;
  lon: number;
  lat: number;
}

// Gulf of Finland coastal weather stations
export const GULF_OF_FINLAND_STATIONS: WeatherStation[] = [
  { fmisid: '100932', name: 'Hanko Russarö', lon: 22.9487, lat: 59.7736 },
  { fmisid: '100946', name: 'Hanko Tulliniemi', lon: 22.9125, lat: 59.8086 },
  { fmisid: '100969', name: 'Inkoo Bågaskär', lon: 24.0141, lat: 59.9311 },
  { fmisid: '100997', name: 'Kirkkonummi Mäkiluoto', lon: 24.3502, lat: 59.9198 },
  { fmisid: '100996', name: 'Helsinki Harmaja', lon: 24.9754, lat: 60.1051 },
  { fmisid: '151028', name: 'Helsinki Vuosaari satama', lon: 25.1959, lat: 60.2087 },
  { fmisid: '101022', name: 'Porvoo Kalbådagrund', lon: 25.5988, lat: 59.9857 },
  { fmisid: '101023', name: 'Porvoo Emäsalo', lon: 25.6255, lat: 60.2038 },
  { fmisid: '101039', name: 'Loviisa Orrengrund', lon: 26.4476, lat: 60.2748 },
  { fmisid: '101042', name: 'Kotka Haapasaari', lon: 27.1848, lat: 60.2868 },
];

export interface ObservationData {
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  gustSpeed?: number;
  pressure?: number;
  timestamp: string;
}

export interface StationObservations {
  station: WeatherStation;
  observations: ObservationData;
  error?: string;
}

interface CoverageJSONResponse {
  type: string;
  domain: {
    axes: {
      t: { values: string[] };
      x: { values: number[] };
      y: { values: number[] };
    };
  };
  parameters: Record<string, unknown>;
  ranges: {
    ta_pt1m_avg?: { values: number[] };
    ws_pt10m_avg?: { values: number[] };
    wd_pt10m_avg?: { values: number[] };
    wg_pt1h_max?: { values: number[] };
    pa_pt1m_avg?: { values: number[] };
  };
}

/**
 * Fetch latest observations for a specific station
 * @param fmisid - Station ID (FMI Station ID)
 * @param datetime - ISO datetime string or range (default: last hour)
 */
export const getStationObservations = async (
  fmisid: string,
  datetime?: string
): Promise<ObservationData> => {
  // Use last hour as time range if datetime not provided to get latest observation
  let dt = datetime;
  if (!dt) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    dt = `${oneHourAgo.toISOString()}/${now.toISOString()}`;
  }
  
  const params = new URLSearchParams({
    datetime: dt,
    'parameter-name': 'ta_pt1m_avg,ws_pt10m_avg,wd_pt10m_avg,wg_pt1h_max,pa_pt1m_avg',
    f: 'CoverageJSON',
  });

  const url = `${EDR_BASE_URL}/collections/${OPENDATA_COLLECTION}/locations/${fmisid}?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch observations for station ${fmisid}: ${response.statusText}`);
  }

  const data = await response.json() as CoverageJSONResponse;

  // Extract values from the response
  // Find the most recent time point where all parameters have non-null values
  const ranges = data.ranges;
  const timeValues = data.domain.axes.t.values;
  
  let selectedIndex = timeValues.length - 1;
  
  // Search backwards for the most recent complete observation
  for (let i = timeValues.length - 1; i >= 0; i--) {
    const hasAllValues = (
      (ranges.ta_pt1m_avg?.values[i] !== null && ranges.ta_pt1m_avg?.values[i] !== undefined) ||
      (ranges.ws_pt10m_avg?.values[i] !== null && ranges.ws_pt10m_avg?.values[i] !== undefined) ||
      (ranges.wd_pt10m_avg?.values[i] !== null && ranges.wd_pt10m_avg?.values[i] !== undefined) ||
      (ranges.wg_pt1h_max?.values[i] !== null && ranges.wg_pt1h_max?.values[i] !== undefined) ||
      (ranges.pa_pt1m_avg?.values[i] !== null && ranges.pa_pt1m_avg?.values[i] !== undefined)
    );
    
    if (hasAllValues) {
      selectedIndex = i;
      break;
    }
  }
  
  const timestamp = timeValues[selectedIndex];

  return {
    temperature: ranges.ta_pt1m_avg?.values[selectedIndex],
    windSpeed: ranges.ws_pt10m_avg?.values[selectedIndex],
    windDirection: ranges.wd_pt10m_avg?.values[selectedIndex],
    gustSpeed: ranges.wg_pt1h_max?.values[selectedIndex],
    pressure: ranges.pa_pt1m_avg?.values[selectedIndex],
    timestamp,
  };
};

/**
 * Fetch observations for all Gulf of Finland stations
 * @param datetime - ISO datetime string (default: current hour)
 */
export const getAllStationObservations = async (
  datetime?: string
): Promise<StationObservations[]> => {
  const results = await Promise.allSettled(
    GULF_OF_FINLAND_STATIONS.map(async (station) => {
      const observations = await getStationObservations(station.fmisid, datetime);
      return {
        station,
        observations,
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        station: GULF_OF_FINLAND_STATIONS[index],
        observations: {
          timestamp: datetime || new Date().toISOString(),
        },
        error: result.reason instanceof Error ? result.reason.message : String(result.reason) || 'Failed to fetch data',
      };
    }
  });
};
