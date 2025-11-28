import type { FC } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { Air, Thermostat } from '@mui/icons-material';
import WeatherSymbol from './WeatherSymbol';
import type { WeatherDataPoint } from '../types/weather';

interface CurrentWeatherProps {
  data: WeatherDataPoint | null;
  location: string;
}

const CurrentWeather: FC<CurrentWeatherProps> = ({ data, location }) => {
  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">No current weather data available</Typography>
      </Paper>
    );
  }

  const { temperature, windSpeed, weatherSymbol, time } = data;
  const displayTime = new Date(time).toLocaleString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {location}
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {displayTime}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: { md: '0 0 33%' } }}>
          <WeatherSymbol code={weatherSymbol} size="large" />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Thermostat sx={{ fontSize: 40, color: 'error.main' }} />
            <Box>
              <Typography variant="h3" component="span" fontWeight="bold">
                {temperature !== null ? temperature.toFixed(1) : 'N/A'}
              </Typography>
              <Typography variant="h4" component="span" color="text.secondary">
                °C
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Temperature
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Air sx={{ fontSize: 40, color: 'info.main' }} />
            <Box>
              <Typography variant="h4" component="span" fontWeight="bold">
                {windSpeed !== null ? windSpeed.toFixed(1) : 'N/A'}
              </Typography>
              <Typography variant="h5" component="span" color="text.secondary">
                {' '}
                m/s
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Wind Speed
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CurrentWeather;
