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

const getWeatherIcon = (code: number | null) => {
  if (code === null) return { icon: Cloud, label: 'Unknown' };

  // Map FMI weather symbol codes to MUI icons
  if (code === 1) return { icon: WbSunny, label: 'Clear', color: '#FDB813' };
  if (code === 2) return { icon: CloudQueue, label: 'Partly Cloudy', color: '#90A4AE' };
  if (code === 3) return { icon: Cloud, label: 'Cloudy', color: '#78909C' };
  if (code >= 21 && code <= 23) return { icon: Grain, label: 'Showers', color: '#42A5F5' };
  if (code >= 31 && code <= 33) return { icon: Grain, label: 'Rain', color: '#1976D2' };
  if (code >= 41 && code <= 43) return { icon: AcUnit, label: 'Snow Showers', color: '#E3F2FD' };
  if (code >= 51 && code <= 53) return { icon: AcUnit, label: 'Snowfall', color: '#BBDEFB' };
  if (code >= 61 && code <= 64) return { icon: Thunderstorm, label: 'Thunder', color: '#9C27B0' };
  if (code >= 71 && code <= 73) return { icon: Opacity, label: 'Sleet Showers', color: '#607D8B' };
  if (code >= 81 && code <= 83) return { icon: Opacity, label: 'Sleet', color: '#546E7A' };
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
