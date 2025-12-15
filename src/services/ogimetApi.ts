/**
 * Ogimet SYNOP API Service
 * API Documentation: https://www.ogimet.com/
 * Provides access to synoptic weather observations
 */

const OGIMET_BASE_URL = 'https://www.ogimet.com/cgi-bin';

export interface SynopObservation {
  timestamp: Date;
  wmoIndex: string;
  temperature?: number;
  precipitation?: number;
  synopCode: string;
}

export interface StationInfo {
  wmoIndex: string;
  name: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// Common WMO stations in Finland and Scandinavia
const STATION_NAMES: Record<string, StationInfo> = {
  '02974': { wmoIndex: '02974', name: 'Helsinki-Vantaa', country: 'Finland', latitude: 60.33, longitude: 24.97 },
  '02978': { wmoIndex: '02978', name: 'Jokioinen', country: 'Finland', latitude: 60.81, longitude: 23.50 },
  '02935': { wmoIndex: '02935', name: 'Turku', country: 'Finland', latitude: 60.51, longitude: 22.26 },
  '02963': { wmoIndex: '02963', name: 'Tampere', country: 'Finland', latitude: 61.42, longitude: 23.60 },
  '02836': { wmoIndex: '02836', name: 'Oulu', country: 'Finland', latitude: 64.93, longitude: 25.37 },
  '02777': { wmoIndex: '02777', name: 'Rovaniemi', country: 'Finland', latitude: 66.58, longitude: 25.83 },
  '02865': { wmoIndex: '02865', name: 'Jyväskylä', country: 'Finland', latitude: 62.40, longitude: 25.68 },
  '01001': { wmoIndex: '01001', name: 'Jan Mayen', country: 'Norway', latitude: 70.93, longitude: -8.67 },
  '01415': { wmoIndex: '01415', name: 'Oslo-Blindern', country: 'Norway', latitude: 59.94, longitude: 10.72 },
  '01384': { wmoIndex: '01384', name: 'Trondheim', country: 'Norway', latitude: 63.41, longitude: 10.40 },
  '02591': { wmoIndex: '02591', name: 'Stockholm-Arlanda', country: 'Sweden', latitude: 59.65, longitude: 17.95 },
  '02527': { wmoIndex: '02527', name: 'Göteborg', country: 'Sweden', latitude: 57.71, longitude: 11.99 },
  '06180': { wmoIndex: '06180', name: 'Copenhagen', country: 'Denmark', latitude: 55.68, longitude: 12.57 },
};

/**
 * Get station information by WMO index
 */
export const getStationInfo = (wmoIndex: string): StationInfo | null => {
  return STATION_NAMES[wmoIndex] || null;
};

/**
 * Decode SYNOP temperature from group 1SnTTT
 * Temperature is in tenths of degrees Celsius
 * @param group - SYNOP group like "11008" where 1 is sign, 100.8 is temperature
 */
const decodeTemperature = (group: string): number | undefined => {
  if (group.length !== 5 || group[0] !== '1') return undefined;
  
  const sign = group[1] === '0' ? 1 : -1;
  const tempValue = parseInt(group.substring(2), 10);
  
  if (isNaN(tempValue)) return undefined;
  
  return sign * (tempValue / 10);
};

/**
 * Decode SYNOP precipitation from group 6RRRt
 * Precipitation amount in mm
 */
const decodePrecipitation = (group: string): number | undefined => {
  if (group.length < 5 || group[0] !== '6') return undefined;
  
  const precip = parseInt(group.substring(1, 4), 10);
  
  if (isNaN(precip)) return undefined;
  
  // 000 means no precipitation or trace
  if (precip === 0) return 0;
  
  // Values 990-999 have special meanings
  if (precip >= 990) {
    // 990 = 0.0 mm, 991 = 0.1 mm, etc.
    return (precip - 990) / 10;
  }
  
  return precip;
};

/**
 * Parse a SYNOP message and extract weather data
 */
const parseSynopMessage = (wmoIndex: string, year: number, month: number, day: number, hour: number, minute: number, synopCode: string): SynopObservation => {
  const timestamp = new Date(Date.UTC(year, month - 1, day, hour, minute));
  
  const observation: SynopObservation = {
    timestamp,
    wmoIndex,
    synopCode,
  };
  
  // Split SYNOP code into groups
  const groups = synopCode.split(/\s+/);
  
  // Find temperature (group starting with 1)
  for (const group of groups) {
    if (group.startsWith('1') && group.length === 5) {
      const temp = decodeTemperature(group);
      if (temp !== undefined) {
        observation.temperature = temp;
      }
    }
    
    // Find precipitation (group starting with 6)
    if (group.startsWith('6') && group.length >= 5) {
      const precip = decodePrecipitation(group);
      if (precip !== undefined) {
        observation.precipitation = precip;
      }
    }
  }
  
  return observation;
};

/**
 * Format date for Ogimet API (YYYYMMDDHHMM)
 */
const formatOgimetDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}`;
};

/**
 * Fetch SYNOP observations from Ogimet
 * @param wmoIndex - WMO station index (e.g., "02974" for Helsinki-Vantaa)
 * @param startDate - Start date for observations
 * @param endDate - End date for observations
 */
export const getSynopObservations = async (
  wmoIndex: string,
  startDate: Date,
  endDate: Date
): Promise<SynopObservation[]> => {
  const begin = formatOgimetDate(startDate);
  const end = formatOgimetDate(endDate);
  
  const url = `${OGIMET_BASE_URL}/getsynop?block=${wmoIndex}&begin=${begin}&end=${end}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SYNOP data: ${response.statusText}`);
  }
  
  const text = await response.text();
  
  // Check for error messages from Ogimet API
  if (text.startsWith('Status:') && (text.includes('no es correcta') || text.includes('not'))) {
    throw new Error('Invalid date range or WMO index');
  }
  
  const lines = text.trim().split('\n');
  const observations: SynopObservation[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse CSV format: WMO,YYYY,MM,DD,HH,MM,SYNOP_CODE
    const parts = line.split(',');
    if (parts.length < 7) continue;
    
    const [wmo, yearStr, monthStr, dayStr, hourStr, minuteStr, ...synopParts] = parts;
    const synopCode = synopParts.join(',');
    
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      continue;
    }
    
    const observation = parseSynopMessage(wmo, year, month, day, hour, minute, synopCode);
    observations.push(observation);
  }
  
  return observations;
};

/**
 * Get list of available WMO stations
 */
export const getAvailableStations = (): StationInfo[] => {
  return Object.values(STATION_NAMES);
};
