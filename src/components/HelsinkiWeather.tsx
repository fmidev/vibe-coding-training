import { type FC, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Stack,
} from '@mui/material';
import {
  Thermostat,
  Opacity,
  WbCloudy,
  AcUnit,
} from '@mui/icons-material';
import { getPositionData } from '../services/edrApi';

interface WeatherData {
  temperature: number;
  precipitation1h: number;
  precipitationForm: number;
  weatherSymbol: number;
  timestamp: string;
}

interface CoverageJSONResponse {
  domain: {
    axes: {
      t: { values: string[] };
    };
  };
  ranges: {
    temperature?: { values: number[] };
    precipitation1h?: { values: number[] };
    precipitationform?: { values: number[] };
    weathersymbol3?: { values: number[] };
  };
}

const HELSINKI_COORDS = 'POINT(24.9384 60.1699)';

// Mock data for development/demo purposes
const MOCK_DATA = {
  temperature: 6.18,
  precipitation1h: 0.33,
  precipitationForm: 1,
  weatherSymbol: 31,
  timestamp: new Date().toISOString(),
};

// Use mock data in development if API fails
const USE_MOCK_DATA = true;

// Helper function to get precipitation form as text
const getPrecipitationFormText = (code: number): string => {
  const forms: Record<number, string> = {
    0: 'No precipitation',
    1: 'Rain',
    2: 'Sleet',
    3: 'Snow',
    4: 'Freezing rain',
    5: 'Freezing drizzle',
    6: 'Hail',
  };
  return forms[code] || `Code ${code}`;
};

// Helper function to get weather symbol description
const getWeatherSymbolText = (code: number): string => {
  const symbols: Record<number, string> = {
    1: 'Clear',
    2: 'Partly cloudy',
    3: 'Cloudy',
    21: 'Light showers',
    22: 'Showers',
    23: 'Heavy showers',
    31: 'Light rain',
    32: 'Rain',
    33: 'Heavy rain',
    41: 'Light snow showers',
    42: 'Snow showers',
    43: 'Heavy snow showers',
    51: 'Light snowfall',
    52: 'Snowfall',
    53: 'Heavy snowfall',
    61: 'Thunderstorms',
    62: 'Heavy thunderstorms',
    63: 'Thunder',
    64: 'Heavy thunder',
    71: 'Light sleet showers',
    72: 'Sleet showers',
    73: 'Heavy sleet showers',
    81: 'Light sleet',
    82: 'Sleet',
    83: 'Heavy sleet',
    91: 'Fog',
    92: 'Mist',
  };
  return symbols[code] || `Weather code ${code}`;
};

const HelsinkiWeather: FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current time and 1 hour ahead for latest forecast
      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      
      const formatDateTime = (date: Date) => {
        return date.toISOString().split('.')[0] + 'Z';
      };

      const data = await getPositionData(
        'pal_skandinavia',
        HELSINKI_COORDS,
        {
          f: 'CoverageJSON',
          'parameter-name': 'Temperature,Precipitation1h,PrecipitationForm,WeatherSymbol3',
          datetime: `${formatDateTime(now)}/${formatDateTime(later)}`,
        }
      ) as CoverageJSONResponse;

      // Extract the first (most recent) value from each parameter
      const temperature = data.ranges.temperature?.values[0] ?? 0;
      const precipitation1h = data.ranges.precipitation1h?.values[0] ?? 0;
      const precipitationform = data.ranges.precipitationform?.values[0] ?? 0;
      const weathersymbol3 = data.ranges.weathersymbol3?.values[0] ?? 0;
      const timestamp = data.domain.axes.t.values[0];

      setWeatherData({
        temperature,
        precipitation1h,
        precipitationForm: precipitationform,
        weatherSymbol: weathersymbol3,
        timestamp,
      });
    } catch (err) {
      // In development, use mock data if API fails
      if (USE_MOCK_DATA) {
        console.log('Using mock data due to API error:', err);
        setWeatherData(MOCK_DATA);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        console.error('Error fetching weather data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!weatherData) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No weather data available
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" textAlign="center">
        Helsinki Weather
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" textAlign="center" gutterBottom>
        Updated: {new Date(weatherData.timestamp).toLocaleString()}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Temperature */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={4} sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Thermostat sx={{ fontSize: 80 }} />
                <Typography variant="h6" component="div">
                  Temperature
                </Typography>
                <Typography variant="h2" component="div" fontWeight="bold">
                  {weatherData.temperature.toFixed(1)}°C
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Precipitation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={4} sx={{ height: '100%', bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Opacity sx={{ fontSize: 80 }} />
                <Typography variant="h6" component="div">
                  Precipitation (1h)
                </Typography>
                <Typography variant="h2" component="div" fontWeight="bold">
                  {weatherData.precipitation1h.toFixed(2)} mm
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Precipitation Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={4} sx={{ height: '100%', bgcolor: 'secondary.light', color: 'white' }}>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <AcUnit sx={{ fontSize: 80 }} />
                <Typography variant="h6" component="div">
                  Precipitation Form
                </Typography>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {getPrecipitationFormText(weatherData.precipitationForm)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Weather Symbol */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={4} sx={{ height: '100%', bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <WbCloudy sx={{ fontSize: 80 }} />
                <Typography variant="h6" component="div">
                  Weather Condition
                </Typography>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {getWeatherSymbolText(weatherData.weatherSymbol)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HelsinkiWeather;
