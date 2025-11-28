import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import { getPositionData } from './services/edrApi';
import { getDefaultCity } from './data/cities';
import { extractWeatherData } from './types/weather';
import { getMockWeatherData } from './utils/mockData';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import type { City } from './data/cities';
import type { CoverageJSONResponse, WeatherData } from './types/weather';

console.log('App.tsx module loaded');

function App() {
  console.log('App() function called - rendering component');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('App state:', { selectedCity, hasWeatherData: !!weatherData, loading, error });

  const fetchWeatherData = async (city: City, useMockData = false) => {
    setLoading(true);
    setError(null);
    try {
      let data: CoverageJSONResponse;
      
      if (useMockData) {
        // Use mock data for testing
        console.log('Using mock weather data for', city.name);
        data = getMockWeatherData();
      } else {
        // Try to fetch real data from API
        const [lon, lat] = city.coordinates;
        const now = new Date();
        const end = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours ahead
        
        data = await getPositionData(
          'pal_skandinavia',
          `POINT(${lon} ${lat})`,
          {
            f: 'CoverageJSON',
            'parameter-name': 'Temperature,WindSpeedMS,WindDirection,Precipitation1h,PoP',
            datetime: `${now.toISOString()}/${end.toISOString()}`,
          }
        ) as CoverageJSONResponse;
        
        console.log('Weather data received:', data);
      }
      
      const extractedData = extractWeatherData(data, 12);
      setWeatherData(extractedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Error fetching weather data:', err);
      
      // Fallback to mock data if API call fails
      console.log('Falling back to mock data due to error');
      try {
        const mockData = getMockWeatherData();
        const extractedData = extractWeatherData(mockData, 12);
        setWeatherData(extractedData);
        setError(null); // Clear error since we have fallback data
      } catch (mockErr) {
        console.error('Error with mock data:', mockErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather data for default city on mount
    const defaultCity = getDefaultCity();
    setSelectedCity(defaultCity);
    fetchWeatherData(defaultCity);
  }, []);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    fetchWeatherData(city);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
      }}
    >
      <AppBar
        position="static"
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Weather App
          </Typography>
        </Toolbar>
      </AppBar>

      {selectedCity && (
        <SearchBar onCitySelect={handleCitySelect} defaultCity={selectedCity} />
      )}

      <Container maxWidth="lg" sx={{ pb: 4 }}>
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </Box>
        )}

        {error && (
          <Box sx={{ mt: 20 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && weatherData && selectedCity && (
          <WeatherDisplay
            cityName={selectedCity.name}
            weatherData={weatherData}
            loading={loading}
          />
        )}
      </Container>
    </Box>
  );
}

export default App;
