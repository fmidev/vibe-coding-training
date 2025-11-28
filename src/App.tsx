import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import CurrentWeatherDisplay from './components/CurrentWeatherDisplay';
import LocationSelector from './components/LocationSelector';
import ForecastDisplay from './components/ForecastDisplay';
import type { Location } from './types/weather';
import { LOCATIONS } from './types/weather';
import { fetchCurrentWeather, fetch7DayForecast } from './services/weatherService';
import type { CurrentWeather, DailyForecast } from './services/weatherService';
import { getCurrentLocation } from './utils/weatherUtils';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(LOCATIONS[0]); // Default to Helsinki
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [locationName, setLocationName] = useState('Helsinki');

  const loadWeatherData = async (latitude: number, longitude: number, name: string) => {
    setLocationName(name);
    
    // Load current weather
    setWeatherLoading(true);
    try {
      const weather = await fetchCurrentWeather(latitude, longitude);
      setCurrentWeather(weather);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setCurrentWeather(null);
    } finally {
      setWeatherLoading(false);
    }

    // Load forecast
    setForecastLoading(true);
    setForecastError(null);
    try {
      const forecastData = await fetch7DayForecast(latitude, longitude);
      setForecast(forecastData);
      setForecastError(null);
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
      setForecastError(err instanceof Error ? err.message : 'Failed to fetch forecast data');
      setForecast(null);
    } finally {
      setForecastLoading(false);
    }
  };

  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location);
    setIsUsingCurrentLocation(false);
    loadWeatherData(location.coordinates.latitude, location.coordinates.longitude, location.name);
  };

  const handleUseCurrentLocation = async () => {
    try {
      const position = await getCurrentLocation();
      setIsUsingCurrentLocation(true);
      setSelectedLocation(null);
      loadWeatherData(
        position.coords.latitude,
        position.coords.longitude,
        'Current Location'
      );
    } catch {
      setError('Unable to get your current location. Please select a location manually.');
      setSnackbarOpen(true);
      setIsUsingCurrentLocation(false);
    }
  };

  // Load default location (Helsinki) on mount
  useEffect(() => {
    const defaultLocation = LOCATIONS[0];
    loadWeatherData(
      defaultLocation.coordinates.latitude,
      defaultLocation.coordinates.longitude,
      defaultLocation.name
    );
  }, []); // Only run once on mount

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Weather App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Weather Forecast
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check current weather and 7-day forecast for your location
            </Typography>
          </Box>

          <LocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            onUseCurrentLocation={handleUseCurrentLocation}
            isUsingCurrentLocation={isUsingCurrentLocation}
          />

          <CurrentWeatherDisplay
            weather={currentWeather}
            loading={weatherLoading}
            error={error}
            locationName={locationName}
          />

          <ForecastDisplay
            forecast={forecast}
            loading={forecastLoading}
            error={forecastError}
          />
        </Stack>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
