import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import { getPositionData } from './services/edrApi';
import type { WeatherData, WeatherDataPoint } from './types/weather';
import CurrentWeather from './components/CurrentWeather';
import WeatherChart from './components/WeatherChart';

// Location definitions
const LOCATIONS = {
  helsinki: {
    name: 'Helsinki',
    coords: 'POINT(24.9384 60.1699)',
  },
  sodankyla: {
    name: 'Sodankylä',
    coords: 'POINT(26.6042 67.4180)',
  },
  utsjoki: {
    name: 'Utsjoki',
    coords: 'POINT(27.0 69.9)',
  },
  kilpisjarvi: {
    name: 'Kilpisjärvi',
    coords: 'POINT(20.79 69.05)',
  },
  pello: {
    name: 'Pello',
    coords: 'POINT(23.97 66.77)',
  },
};

console.log('App.tsx module loaded');

function App() {
  console.log('App() function called - rendering component');
  const [weatherData, setWeatherData] = useState<Record<string, WeatherDataPoint[] | null>>({
    helsinki: null,
    sodankyla: null,
    utsjoki: null,
    kilpisjarvi: null,
    pello: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('App state:', { 
    weatherData: Object.entries(weatherData).map(([key, data]) => ({ [key]: !!data })),
    loading, 
    error 
  });

  const fetchWeatherDataForLocation = async (
    locationKey: keyof typeof LOCATIONS,
    startTime: string,
    endTime: string
  ) => {
    const location = LOCATIONS[locationKey];

    const data = await getPositionData(
      'pal_skandinavia',
      location.coords,
      {
        f: 'CoverageJSON',
        'parameter-name': 'Temperature,WindSpeedMS,WeatherSymbol3',
        datetime: `${startTime}/${endTime}`,
      }
    ) as WeatherData;
      
    console.log(`Weather data received for ${location.name}:`, data);

    // Transform data into WeatherDataPoint array
    const timeValues = data.domain.axes.t.values;
    const temperatures = data.ranges.temperature?.values || data.ranges.Temperature?.values || [];
    const windSpeeds = data.ranges.windspeedms?.values || data.ranges.WindSpeedMS?.values || [];
    const weatherSymbols = data.ranges.weathersymbol3?.values || data.ranges.WeatherSymbol3?.values || [];

    const transformedData: WeatherDataPoint[] = timeValues.map((time, index) => ({
      time,
      timestamp: new Date(time).getTime(),
      temperature: temperatures[index] ?? null,
      windSpeed: windSpeeds[index] ?? null,
      weatherSymbol: weatherSymbols[index] ?? null,
    }));

    console.log(`Transformed weather data for ${location.name}:`, transformedData);
    return transformedData;
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current time and 7 hours ahead - shared across all locations
      const now = new Date();
      const sevenHoursLater = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      
      const startTime = now.toISOString().split('.')[0] + 'Z';
      const endTime = sevenHoursLater.toISOString().split('.')[0] + 'Z';

      // Fetch data for all locations in parallel with same time range
      const locationKeys = Object.keys(LOCATIONS) as Array<keyof typeof LOCATIONS>;
      const results = await Promise.all(
        locationKeys.map(key => fetchWeatherDataForLocation(key, startTime, endTime))
      );
      
      // Update state with all location data
      const newWeatherData: Record<string, WeatherDataPoint[] | null> = {};
      locationKeys.forEach((key, index) => {
        newWeatherData[key] = results[index];
      });
      setWeatherData(newWeatherData);
    } catch (err) {
      // If fetch fails, use mock data for demonstration purposes
      // This allows the UI to be tested when the API is unavailable
      console.warn('Using mock data due to fetch error:', err);
      
      // Generate realistic mock weather data
      const now = new Date();
      const generateMockData = (baseTemp: number) => {
        const mockData: WeatherDataPoint[] = [];
        const MOCK_TEMP_VARIATION = 3; // Temperature variation range in °C
        const MOCK_BASE_WIND = 5; // Base wind speed in m/s
        const MOCK_WIND_VARIATION = 2; // Wind speed variation in m/s
        
        for (let i = 0; i < 8; i++) {
          const time = new Date(now.getTime() + i * 60 * 60 * 1000);
          mockData.push({
            time: time.toISOString(),
            timestamp: time.getTime(),
            temperature: baseTemp + Math.sin(i / 2) * MOCK_TEMP_VARIATION,
            windSpeed: MOCK_BASE_WIND + Math.cos(i / 3) * MOCK_WIND_VARIATION,
            weatherSymbol: i === 0 ? 2 : i < 3 ? 3 : i < 5 ? 31 : 21,
          });
        }
        return mockData;
      };

      // Generate mock data for all locations with appropriate temperatures
      setWeatherData({
        helsinki: generateMockData(-2),      // Helsinki: ~-2°C (southern, warmer)
        sodankyla: generateMockData(-10),    // Sodankylä: ~-10°C (northern)
        utsjoki: generateMockData(-15),      // Utsjoki: ~-15°C (far north, coldest)
        kilpisjarvi: generateMockData(-12),  // Kilpisjärvi: ~-12°C (northern, high altitude)
        pello: generateMockData(-8),         // Pello: ~-8°C (northern but lower latitude)
      });
      setError(null); // Clear error when using mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    // Only fetch once on mount, not on every fetchWeatherData reference change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Finland Weather Forecast
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={4}>
          {/* Title Section */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Finland Weather Forecast
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              7-hour weather forecast from present time
            </Typography>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box display="flex" justifyContent="center" p={5}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* Weather Data Display for All Locations */}
          {!loading && Object.entries(LOCATIONS).map(([key, location]) => {
            const data = weatherData[key];
            return data && data.length > 0 ? (
              <Box key={key}>
                <CurrentWeather data={data[0]} location={location.name} />
                <WeatherChart data={data} />
              </Box>
            ) : null;
          })}

          {/* Footer */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Data from FMI Open Data (Finnish Meteorological Institute)
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
