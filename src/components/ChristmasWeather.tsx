import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { AcUnit, WbSunny } from '@mui/icons-material';
import { getPositionData } from '../services/edrApi';

interface WeatherData {
  location: string;
  coordinates: string;
  temperature: number;
  cloudCover: number;
  windSpeed: number;
  precipitation: number;
}

interface CoverageJSONResponse {
  domain: {
    axes: {
      t: { values: string[] };
    };
  };
  parameters: {
    [key: string]: {
      unit?: {
        symbol?: { value?: string } | string;
      };
    };
  };
  ranges: {
    [key: string]: {
      values: number[];
    };
  };
}

// Finland locations - using Helsinki as representative
const FINLAND_LOCATIONS = [
  { name: 'Helsinki', coords: 'POINT(24.945 60.192)' },
];

const ChristmasWeather: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [christmasWeather, setChristmasWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformToChristmasWeather = (weather: WeatherData): WeatherData => {
    return {
      ...weather,
      location: `${weather.location} (Christmas Edition)`,
      // Make it colder (ensure it's below 0°C for snow)
      temperature: Math.min(weather.temperature - 10, -2),
      // Add more clouds (90-100% for snow)
      cloudCover: Math.max(weather.cloudCover, 85),
      // Reduce wind slightly for peaceful Christmas feeling
      windSpeed: weather.windSpeed * 0.7,
      // Add significant precipitation (snow!)
      precipitation: Math.max(weather.precipitation * 2, 5),
    };
  };

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = FINLAND_LOCATIONS[0];
      
      // Get current time and next hour for forecast
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      
      const datetime = `${now.toISOString().split('.')[0]}Z/${nextHour.toISOString().split('.')[0]}Z`;
      
      const data = await getPositionData(
        'pal_skandinavia',
        location.coords,
        {
          f: 'CoverageJSON',
          'parameter-name': 'Temperature,TotalCloudCover,WindSpeedMS,Precipitation1h',
          datetime,
        }
      ) as CoverageJSONResponse;

      // Extract the first time step data
      const ranges = data.ranges;
      const temperature = ranges.Temperature?.values[0] ?? 5;
      const cloudCover = ranges.TotalCloudCover?.values[0] ?? 50;
      const windSpeed = ranges.WindSpeedMS?.values[0] ?? 5;
      const precipitation = ranges.Precipitation1h?.values[0] ?? 0;

      const current: WeatherData = {
        location: location.name,
        coordinates: location.coords,
        temperature,
        cloudCover,
        windSpeed,
        precipitation,
      };

      const christmas = transformToChristmasWeather(current);

      setCurrentWeather(current);
      setChristmasWeather(christmas);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      // Use demo data if API fails
      const location = FINLAND_LOCATIONS[0];
      const demoWeather: WeatherData = {
        location: `${location.name} (Demo Data)`,
        coordinates: location.coords,
        temperature: 5.2,
        cloudCover: 65,
        windSpeed: 4.5,
        precipitation: 0.2,
      };
      
      const christmas = transformToChristmasWeather(demoWeather);
      
      setCurrentWeather(demoWeather);
      setChristmasWeather(christmas);
      setError('Using demo data - Live API is not accessible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const renderWeatherCard = (weather: WeatherData | null, title: string, isChristmas: boolean) => (
    <Card elevation={3} sx={{ height: '100%', bgcolor: isChristmas ? '#e3f2fd' : 'white' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="h3" color={isChristmas ? 'primary' : 'text.primary'}>
              {title}
            </Typography>
            {isChristmas ? <AcUnit color="primary" /> : <WbSunny color="warning" />}
          </Box>
          
          {weather && (
            <>
              <Typography variant="h6" color="text.secondary">
                {weather.location}
              </Typography>
              
              <Box>
                <Typography variant="h2" component="div" fontWeight="bold">
                  {weather.temperature.toFixed(1)}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Temperature
                </Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={2}>
                <Box flex="1" minWidth="120px">
                  <Typography variant="h6">
                    {weather.cloudCover.toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cloud Cover
                  </Typography>
                </Box>
                <Box flex="1" minWidth="120px">
                  <Typography variant="h6">
                    {weather.windSpeed.toFixed(1)} m/s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wind Speed
                  </Typography>
                </Box>
                <Box flex="1" minWidth="120px">
                  <Typography variant="h6">
                    {weather.precipitation.toFixed(1)} mm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isChristmas ? 'Snow (1h)' : 'Precipitation (1h)'}
                  </Typography>
                </Box>
              </Box>

              {isChristmas && (
                <Box mt={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {weather.temperature < 0 && (
                      <Chip label="❄️ Freezing" color="primary" size="small" />
                    )}
                    {weather.cloudCover > 80 && (
                      <Chip label="☁️ Overcast" color="primary" size="small" />
                    )}
                    {weather.precipitation > 0 && (
                      <Chip label="🎄 Snowing" color="primary" size="small" />
                    )}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
        🎅 Christmas Weather in Finland
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        See how the current weather would look like in a perfect Christmas setting!
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && currentWeather && christmasWeather && (
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1" minWidth="300px">
            {renderWeatherCard(currentWeather, 'Current Weather', false)}
          </Box>
          <Box flex="1" minWidth="300px">
            {renderWeatherCard(christmasWeather, 'Christmas Weather ❄️🎄', true)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChristmasWeather;
