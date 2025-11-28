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
    
    // Try to fetch real data from API with timeout
    if (!useMockData) {
      try {
        const [lon, lat] = city.coordinates;
        const now = new Date();
        const end = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours ahead
        
        // Create a promise that rejects after 5 seconds
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000);
        });
        
        const fetchPromise = getPositionData(
          'pal_skandinavia',
          `POINT(${lon} ${lat})`,
          {
            f: 'CoverageJSON',
            'parameter-name': 'Temperature,WindSpeedMS,WindDirection,Precipitation1h,PoP',
            datetime: `${now.toISOString()}/${end.toISOString()}`,
          }
        ) as Promise<CoverageJSONResponse>;
        
        // Race between timeout and actual fetch
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        
        console.log('Weather data received from API:', data);
        
        const extractedData = extractWeatherData(data, 12);
        setWeatherData(extractedData);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error fetching weather data from API:', err);
        console.log('Falling back to mock data...');
        // Continue to fallback below
      }
    }
    
    // Use mock data (either explicitly requested or as fallback)
    try {
      console.log('Using mock weather data for', city.name);
      const mockData = getMockWeatherData();
      const extractedData = extractWeatherData(mockData, 12);
      setWeatherData(extractedData);
      setError(null);
    } catch (mockErr) {
      console.error('Error with mock data:', mockErr);
      setError('Failed to load weather data');
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
