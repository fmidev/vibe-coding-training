/**
 * OGC EDR 1.1 API Service for FMI Open Data
 * API Documentation: https://docs.ogc.org/is/19-086r6/19-086r6.html
 * FMI Endpoint: https://opendata.fmi.fi/edr
 * Default Collection: pal_skandinavia
 */

const EDR_BASE_URL = 'https://opendata.fmi.fi/edr';
const DEFAULT_COLLECTION = 'pal_skandinavia';

export interface Collection {
  id: string;
  title: string;
  description: string;
  extent?: {
    spatial?: {
      bbox: number[][];
    };
    temporal?: {
      interval: string[][];
    };
  };
  parameter_names?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CollectionsResponse {
  collections: Collection[];
  links?: Array<{
    href: string;
    rel: string;
    type?: string;
    title?: string;
  }>;
}

/**
 * Fetch all available collections from the EDR API
 */
export const getCollections = async (): Promise<CollectionsResponse> => {
  const response = await fetch(`${EDR_BASE_URL}/collections`);
  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetch metadata for a specific collection
 * @param collectionId - Collection ID (default: pal_skandinavia)
 */
export const getCollection = async (
  collectionId: string = DEFAULT_COLLECTION
): Promise<Collection> => {
  const response = await fetch(`${EDR_BASE_URL}/collections/${collectionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch collection ${collectionId}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetch data from a position query
 * @param collectionId - Collection ID
 * @param coords - Coordinates in format "POINT(lon lat)"
 * @param params - Additional query parameters
 */
export const getPositionData = async (
  collectionId: string,
  coords: string,
  params?: Record<string, string>
): Promise<unknown> => {
  const queryParams = new URLSearchParams(params);
  const url = `${EDR_BASE_URL}/collections/${collectionId}/position?coords=${encodeURIComponent(coords)}&${queryParams}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch position data: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetch data from an area query
 * @param collectionId - Collection ID
 * @param coords - Polygon coordinates in WKT format, e.g., "POLYGON((lon1 lat1, lon2 lat2, ...))"
 * @param params - Additional query parameters
 */
export const getAreaData = async (
  collectionId: string,
  coords: string,
  params?: Record<string, string>
): Promise<unknown> => {
  const queryParams = new URLSearchParams(params);
  const url = `${EDR_BASE_URL}/collections/${collectionId}/area?coords=${encodeURIComponent(coords)}&${queryParams}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch area data: ${response.statusText}`);
  }
  return response.json();
};
