import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Thermostat,
  Water,
  Air,
} from '@mui/icons-material';
import { getPositionData } from '../services/edrApi';
import type { CoverageJSONResponse } from '../types/weather';

// Refresh interval in milliseconds (5 minutes)
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface WeatherData {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  observationTime: string | null;
}

const WeatherObservations = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHelsinkiWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      // Helsinki coordinates: 24.94°E, 60.17°N
      // Using current time for latest observation
      const now = new Date();
      const datetime = now.toISOString();

      const data = await getPositionData(
        'opendata',
        'POINT(24.94 60.17)',
        {
          f: 'CoverageJSON',
          'parameter-name': 'ta_pt1m_avg,rh_pt1m_avg,ws_pt10m_avg',
          datetime: datetime,
        }
      ) as CoverageJSONResponse;

      // Extract weather values
      const temperature = data.ranges.ta_pt1m_avg?.values[0] ?? null;
      const humidity = data.ranges.rh_pt1m_avg?.values[0] ?? null;
      const windSpeed = data.ranges.ws_pt10m_avg?.values[0] ?? null;
      const observationTime = data.domain.axes.t.values[0] ?? null;

      setWeatherData({
        temperature,
        humidity,
        windSpeed,
        observationTime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelsinkiWeather();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHelsinkiWeather, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading && !weatherData) {
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

  if (error && !weatherData) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const formatObservationTime = (timeStr: string | null) => {
    if (!timeStr) return 'N/A';
    const date = new Date(timeStr);
    return date.toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            🌤️ Current Weather in Helsinki
          </Typography>
          {loading && weatherData && (
            <CircularProgress size={20} />
          )}
        </Box>
        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {weatherData && (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Observation time: {formatObservationTime(weatherData.observationTime)}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              sx={{ mt: 1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'primary.light',
                  borderRadius: 2,
                  color: 'white',
                  flex: 1,
                }}
              >
                <Thermostat sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" component="div">
                  {weatherData.temperature !== null
                    ? `${weatherData.temperature.toFixed(1)}°C`
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">Temperature</Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 2,
                  color: 'white',
                  flex: 1,
                }}
              >
                <Water sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" component="div">
                  {weatherData.humidity !== null
                    ? `${weatherData.humidity.toFixed(0)}%`
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">Humidity</Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'secondary.light',
                  borderRadius: 2,
                  color: 'white',
                  flex: 1,
                }}
              >
                <Air sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" component="div">
                  {weatherData.windSpeed !== null
                    ? `${weatherData.windSpeed.toFixed(1)} m/s`
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">Wind Speed</Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Data source: FMI Open Data (opendata collection)
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherObservations;
