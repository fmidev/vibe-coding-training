/**
 * Utility functions for color mapping and weather data visualization
 */

/**
 * Get color for temperature value
 * @param temp - Temperature in Celsius
 * @returns Hex color code
 */
export const getTemperatureColor = (temp: number): string => {
  // Temperature color scale from cold (blue) to hot (red)
  if (temp <= -20) return '#1a0066'; // Deep purple for very cold
  if (temp <= -15) return '#2e1a66'; // Dark purple
  if (temp <= -10) return '#0033cc'; // Dark blue
  if (temp <= -5) return '#0066ff'; // Blue
  if (temp <= 0) return '#00ccff'; // Light blue
  if (temp <= 5) return '#00ff99'; // Cyan
  if (temp <= 10) return '#66ff66'; // Light green
  if (temp <= 15) return '#ccff33'; // Yellow-green
  if (temp <= 20) return '#ffff00'; // Yellow
  if (temp <= 25) return '#ffcc00'; // Orange-yellow
  if (temp <= 30) return '#ff9900'; // Orange
  return '#ff0000'; // Red for hot
};

/**
 * Get color for snowfall/snow depth value
 * @param snow - Snow depth in cm
 * @returns Hex color code
 */
export const getSnowfallColor = (snow: number): string => {
  // Snow depth color scale from no snow (transparent) to heavy snow (white)
  if (snow <= 0) return '#00000000'; // Transparent for no snow
  if (snow <= 1) return '#e6f2ff'; // Very light blue
  if (snow <= 5) return '#cce5ff'; // Light blue
  if (snow <= 10) return '#99ccff'; // Medium light blue
  if (snow <= 20) return '#66b3ff'; // Medium blue
  if (snow <= 30) return '#3399ff'; // Blue
  if (snow <= 50) return '#0080ff'; // Dark blue
  return '#0066cc'; // Very dark blue for heavy snow
};

/**
 * Get color for precipitation value
 * @param precip - Precipitation in mm
 * @returns Hex color code
 */
export const getPrecipitationColor = (precip: number): string => {
  // Precipitation color scale from no rain to heavy rain
  if (precip <= 0) return '#00000000'; // Transparent for no precipitation
  if (precip <= 0.1) return '#d4f0ff'; // Very light blue
  if (precip <= 0.5) return '#99d6ff'; // Light blue
  if (precip <= 1) return '#66c2ff'; // Medium light blue
  if (precip <= 2) return '#33adff'; // Medium blue
  if (precip <= 5) return '#0099ff'; // Blue
  if (precip <= 10) return '#0077cc'; // Dark blue
  return '#005599'; // Very dark blue for heavy rain
};

/**
 * Interpolate between two colors
 * @param color1 - Start color (hex)
 * @param color2 - End color (hex)
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated hex color
 */
export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
