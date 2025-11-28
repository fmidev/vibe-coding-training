import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import {
  WbSunny,
  Cloud,
  CloudQueue,
  Grain,
  AcUnit,
  Thunderstorm,
  Opacity,
  Visibility,
} from '@mui/icons-material';

interface WeatherSymbolProps {
  code: number | null;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Maps FMI WeatherSymbol3 codes to Material UI icons and labels
 * 
 * FMI Weather Symbol Codes (WeatherSymbol3):
 * - 1: Clear
 * - 2: Partly cloudy
 * - 3: Cloudy
 * - 21-23: Showers (light, moderate, heavy)
 * - 31-33: Rain (light, moderate, heavy)
 * - 41-43: Snow showers (light, moderate, heavy)
 * - 51-53: Snowfall (light, moderate, heavy)
 * - 61-64: Thunder (showers, heavy showers, thunder, heavy thunder)
 * - 71-73: Sleet showers (light, moderate, heavy)
 * - 81-83: Sleet (light, moderate, heavy)
 * - 91-92: Mist/Fog
 * 
 * Reference: https://en.ilmatieteenlaitos.fi/weather-symbols
 */
const getWeatherIcon = (code: number | null) => {
  if (code === null) return { icon: Cloud, label: 'Unknown' };

  // Clear and cloudy conditions
  if (code === 1) return { icon: WbSunny, label: 'Clear', color: '#FDB813' };
  if (code === 2) return { icon: CloudQueue, label: 'Partly Cloudy', color: '#90A4AE' };
  if (code === 3) return { icon: Cloud, label: 'Cloudy', color: '#78909C' };
  
  // Precipitation
  if (code >= 21 && code <= 23) return { icon: Grain, label: 'Showers', color: '#42A5F5' };
  if (code >= 31 && code <= 33) return { icon: Grain, label: 'Rain', color: '#1976D2' };
  if (code >= 41 && code <= 43) return { icon: AcUnit, label: 'Snow Showers', color: '#E3F2FD' };
  if (code >= 51 && code <= 53) return { icon: AcUnit, label: 'Snowfall', color: '#BBDEFB' };
  
  // Severe weather
  if (code >= 61 && code <= 64) return { icon: Thunderstorm, label: 'Thunder', color: '#9C27B0' };
  
  // Mixed precipitation
  if (code >= 71 && code <= 73) return { icon: Opacity, label: 'Sleet Showers', color: '#607D8B' };
  if (code >= 81 && code <= 83) return { icon: Opacity, label: 'Sleet', color: '#546E7A' };
  
  // Visibility
  if (code >= 91 && code <= 92) return { icon: Visibility, label: 'Fog', color: '#CFD8DC' };

  return { icon: Cloud, label: 'Unknown', color: '#90A4AE' };
};

const WeatherSymbol: FC<WeatherSymbolProps> = ({ code, size = 'medium' }) => {
  const { icon: Icon, label, color } = getWeatherIcon(code);

  const iconSize = {
    small: 32,
    medium: 48,
    large: 64,
  }[size];

  const fontSize = {
    small: '0.75rem',
    medium: '0.875rem',
    large: '1rem',
  }[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Icon sx={{ fontSize: iconSize, color: color || 'inherit' }} />
      <Typography variant="caption" sx={{ fontSize, textAlign: 'center' }}>
        {label}
      </Typography>
    </Box>
  );
};

export default WeatherSymbol;
