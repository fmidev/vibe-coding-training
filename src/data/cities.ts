/**
 * City coordinates data for weather queries
 * Coordinates format: [longitude, latitude]
 */

export interface City {
  name: string;
  country: string;
  coordinates: [number, number]; // [lon, lat]
}

export const cities: City[] = [
  { name: 'Helsinki', country: 'Finland', coordinates: [24.9384, 60.1699] },
  { name: 'Espoo', country: 'Finland', coordinates: [24.6522, 60.2055] },
  { name: 'Tampere', country: 'Finland', coordinates: [23.7610, 61.4978] },
  { name: 'Vantaa', country: 'Finland', coordinates: [25.0378, 60.2934] },
  { name: 'Oulu', country: 'Finland', coordinates: [25.4714, 65.0121] },
  { name: 'Turku', country: 'Finland', coordinates: [22.2666, 60.4518] },
  { name: 'Jyväskylä', country: 'Finland', coordinates: [25.7333, 62.2426] },
  { name: 'Lahti', country: 'Finland', coordinates: [25.6612, 60.9827] },
  { name: 'Kuopio', country: 'Finland', coordinates: [27.6782, 62.8924] },
  { name: 'Pori', country: 'Finland', coordinates: [21.7972, 61.4847] },
  { name: 'Stockholm', country: 'Sweden', coordinates: [18.0686, 59.3293] },
  { name: 'Oslo', country: 'Norway', coordinates: [10.7522, 59.9139] },
  { name: 'Copenhagen', country: 'Denmark', coordinates: [12.5683, 55.6761] },
  { name: 'Reykjavik', country: 'Iceland', coordinates: [-21.8174, 64.1466] },
];

export const getDefaultCity = (): City => {
  return cities[0]; // Helsinki as default
};

export const searchCities = (query: string): City[] => {
  const lowerQuery = query.toLowerCase();
  return cities.filter(
    (city) =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery)
  );
};
