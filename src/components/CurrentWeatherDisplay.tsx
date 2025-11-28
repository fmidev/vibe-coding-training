import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { getWeatherSymbol } from '../utils/weatherUtils';
import type { CurrentWeather } from '../services/weatherService';

interface CurrentWeatherDisplayProps {
  weather: CurrentWeather | null;
  loading: boolean;
  error: string | null;
  locationName: string;
}

const CurrentWeatherDisplay: React.FC<CurrentWeatherDisplayProps> = ({
  weather,
  loading,
  error,
  locationName,
}) => {
  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography color="error" variant="h6">
            Error loading weather
          </Typography>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  const symbolInfo = getWeatherSymbol(weather.weatherSymbol);
  const WeatherIcon = symbolInfo.icon;

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Current Weather
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {locationName}
        </Typography>
        
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          mt={2}
        >
          <WeatherIcon
            sx={{ fontSize: 80, color: symbolInfo.color, mb: 2 }}
          />
          <Typography variant="h2" component="div" fontWeight="bold">
            {weather.temperature.toFixed(1)}°C
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            {symbolInfo.description}
          </Typography>
        </Box>

        {(weather.windSpeed !== undefined || weather.humidity !== undefined || weather.cloudCover !== undefined) && (
          <Box mt={3} display="flex" justifyContent="space-around" flexWrap="wrap">
            {weather.windSpeed !== undefined && (
              <Box textAlign="center" m={1}>
                <Typography variant="body2" color="text.secondary">
                  Wind Speed
                </Typography>
                <Typography variant="h6">
                  {weather.windSpeed.toFixed(1)} m/s
                </Typography>
              </Box>
            )}
            {weather.humidity !== undefined && (
              <Box textAlign="center" m={1}>
                <Typography variant="body2" color="text.secondary">
                  Humidity
                </Typography>
                <Typography variant="h6">
                  {weather.humidity.toFixed(0)}%
                </Typography>
              </Box>
            )}
            {weather.cloudCover !== undefined && (
              <Box textAlign="center" m={1}>
                <Typography variant="body2" color="text.secondary">
                  Cloud Cover
                </Typography>
                <Typography variant="h6">
                  {weather.cloudCover.toFixed(0)}%
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" display="block" mt={2} textAlign="center">
          Last updated: {new Date(weather.timestamp).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherDisplay;
