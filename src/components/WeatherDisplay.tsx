import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { Thermostat, Air, Cloud } from '@mui/icons-material';
import { getPositionData } from '../services/edrApi';

interface CoverageJSONResponse {
  type: string;
  domain: {
    axes: {
      t: { values: string[] };
      [key: string]: unknown;
    };
  };
  parameters: {
    [key: string]: {
      description?: { fi?: string };
      unit?: {
        label?: { fi?: string };
        symbol?: {
          type?: string;
          value?: string;
        } | string;
      };
      observedProperty?: {
        id?: string;
        label?: { fi?: string };
      };
    };
  };
  ranges: {
    [key: string]: {
      values: number[];
    };
  };
}

interface WeatherData {
  temperature: number[];
  windSpeed: number[];
  cloudCover: number[];
  timestamps: string[];
}

interface CityWeatherProps {
  city: string;
  coords: string;
}

const CityWeather = ({ city, coords }: CityWeatherProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current time and 6 hours from now
        const now = new Date();
        const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        
        // Format dates to ISO string
        const startTime = now.toISOString();
        const endTime = sixHoursLater.toISOString();

        const data = await getPositionData(
          'pal_skandinavia',
          coords,
          {
            f: 'CoverageJSON',
            'parameter-name': 'Temperature,WindSpeedMS,TotalCloudCover',
            datetime: `${startTime}/${endTime}`,
          }
        ) as CoverageJSONResponse;

        // Extract weather data
        const temperature = data.ranges.Temperature?.values || [];
        const windSpeed = data.ranges.WindSpeedMS?.values || [];
        const cloudCover = data.ranges.TotalCloudCover?.values || [];
        const timestamps = data.domain.axes.t.values || [];

        setWeatherData({
          temperature,
          windSpeed,
          cloudCover,
          timestamps,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        console.error(`Error fetching weather for ${city}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, coords]);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {city}
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress size={40} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {city}
          </Typography>
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData || weatherData.temperature.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {city}
          </Typography>
          <Alert severity="info">No weather data available</Alert>
        </CardContent>
      </Card>
    );
  }

  // Get current weather (first value)
  const currentTemp = weatherData.temperature[0];
  const currentWind = weatherData.windSpeed[0];
  const currentCloud = weatherData.cloudCover[0];

  return (
    <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          {city}
        </Typography>
        
        <Stack spacing={2}>
          {/* Current Weather */}
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Current Weather
            </Typography>
            <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Thermostat />
                <Typography variant="h6">
                  {currentTemp.toFixed(1)}°C
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Air />
                <Typography variant="h6">
                  {currentWind.toFixed(1)} m/s
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Cloud />
                <Typography variant="h6">
                  {currentCloud.toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* 6-Hour Forecast */}
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
              6-Hour Forecast
            </Typography>
            <Stack spacing={0.5}>
              {weatherData.timestamps.slice(1, 7).map((timestamp, index) => {
                const temp = weatherData.temperature[index + 1];
                const wind = weatherData.windSpeed[index + 1];
                const cloud = weatherData.cloudCover[index + 1];
                const time = new Date(timestamp);
                
                return (
                  <Box
                    key={timestamp}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                      borderBottom: index < 5 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    }}
                  >
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                      {temp.toFixed(1)}°C
                    </Typography>
                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                      {wind.toFixed(1)} m/s
                    </Typography>
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {cloud.toFixed(0)}%
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const WeatherDisplay = () => {
  return (
    <Box sx={{ py: 3, bgcolor: 'grey.100' }}>
      <Grid container spacing={3} maxWidth="lg" sx={{ mx: 'auto', px: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CityWeather city="Helsinki" coords="POINT(24.94 60.17)" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CityWeather city="Turku" coords="POINT(22.27 60.45)" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WeatherDisplay;
