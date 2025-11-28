import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getPositionData } from '../services/edrApi';

interface WeatherData {
  location: string;
  lat: number;
  lon: number;
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

// Finland cities for weather data points
const FINLAND_CITIES = [
  { name: 'Helsinki', lat: 60.1699, lon: 24.9384 },
  { name: 'Tampere', lat: 61.4978, lon: 23.7610 },
  { name: 'Oulu', lat: 65.0121, lon: 25.4651 },
  { name: 'Turku', lat: 60.4518, lon: 22.2666 },
  { name: 'Jyväskylä', lat: 62.2426, lon: 25.7473 },
  { name: 'Rovaniemi', lat: 66.5039, lon: 25.7294 },
  { name: 'Kuopio', lat: 62.8924, lon: 27.6782 },
  { name: 'Vaasa', lat: 63.0951, lon: 21.6157 },
];

// Christmas weather transformation constants
const TEMPERATURE_REDUCTION = 10;
const MIN_CHRISTMAS_TEMPERATURE = -2;
const MIN_CLOUD_COVER = 85;
const WIND_SPEED_MULTIPLIER = 0.7;
const PRECIPITATION_MULTIPLIER = 2;
const MIN_PRECIPITATION = 5;

// Default fallback values
const DEFAULT_TEMPERATURE = 5;
const DEFAULT_CLOUD_COVER = 50;
const DEFAULT_WIND_SPEED = 5;
const DEFAULT_PRECIPITATION = 0;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

// Temperature color scale
const getTemperatureColor = (temp: number): string => {
  if (temp < -15) return '#0000FF'; // Deep blue
  if (temp < -10) return '#3366FF'; // Blue
  if (temp < -5) return '#66B2FF'; // Light blue
  if (temp < 0) return '#99CCFF'; // Pale blue
  if (temp < 5) return '#FFFF99'; // Pale yellow
  if (temp < 10) return '#FFCC66'; // Light orange
  if (temp < 15) return '#FF9933'; // Orange
  return '#FF6600'; // Red-orange
};

const ChristmasWeatherMaps: React.FC = () => {
  const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData[]>([]);
  const [christmasWeatherData, setChristmasWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformToChristmasWeather = (weather: WeatherData): WeatherData => {
    return {
      ...weather,
      temperature: Math.min(weather.temperature - TEMPERATURE_REDUCTION, MIN_CHRISTMAS_TEMPERATURE),
      cloudCover: Math.max(weather.cloudCover, MIN_CLOUD_COVER),
      windSpeed: weather.windSpeed * WIND_SPEED_MULTIPLIER,
      precipitation: Math.max(weather.precipitation * PRECIPITATION_MULTIPLIER, MIN_PRECIPITATION),
    };
  };

  const fetchWeatherForCity = async (city: typeof FINLAND_CITIES[0]): Promise<WeatherData> => {
    try {
      const now = new Date();
      const nextHour = new Date(now.getTime() + MILLISECONDS_PER_HOUR);
      const datetime = `${now.toISOString().split('.')[0]}Z/${nextHour.toISOString().split('.')[0]}Z`;
      
      const data = await getPositionData(
        'pal_skandinavia',
        `POINT(${city.lon} ${city.lat})`,
        {
          f: 'CoverageJSON',
          'parameter-name': 'Temperature,TotalCloudCover,WindSpeedMS,Precipitation1h',
          datetime,
        }
      ) as CoverageJSONResponse;

      const ranges = data.ranges;
      return {
        location: city.name,
        lat: city.lat,
        lon: city.lon,
        temperature: ranges.Temperature?.values[0] ?? DEFAULT_TEMPERATURE,
        cloudCover: ranges.TotalCloudCover?.values[0] ?? DEFAULT_CLOUD_COVER,
        windSpeed: ranges.WindSpeedMS?.values[0] ?? DEFAULT_WIND_SPEED,
        precipitation: ranges.Precipitation1h?.values[0] ?? DEFAULT_PRECIPITATION,
      };
    } catch (err) {
      console.error(`Error fetching weather for ${city.name}:`, err);
      // Return demo data for this city
      return {
        location: city.name,
        lat: city.lat,
        lon: city.lon,
        temperature: DEFAULT_TEMPERATURE + (Math.random() * 4 - 2),
        cloudCover: DEFAULT_CLOUD_COVER + (Math.random() * 20 - 10),
        windSpeed: DEFAULT_WIND_SPEED + (Math.random() * 2 - 1),
        precipitation: DEFAULT_PRECIPITATION + Math.random() * 2,
      };
    }
  };

  const fetchAllWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const weatherPromises = FINLAND_CITIES.map(city => fetchWeatherForCity(city));
      const currentData = await Promise.all(weatherPromises);
      const christmasData = currentData.map(transformToChristmasWeather);
      
      setCurrentWeatherData(currentData);
      setChristmasWeatherData(christmasData);
      setError('Using demo data - Live API may not be fully accessible');
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllWeatherData();
  }, [fetchAllWeatherData]);

  const renderWeatherMap = (weatherData: WeatherData[], title: string, mapId: string) => (
    <Box flex="1" minWidth="300px">
      <Typography variant="h6" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <Box 
        sx={{ 
          height: '400px', 
          border: '2px solid #ccc', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <MapContainer
          center={[64.5, 26.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          key={mapId}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {weatherData.map((weather, idx) => (
            <CircleMarker
              key={`${mapId}-${idx}`}
              center={[weather.lat, weather.lon]}
              radius={15}
              fillColor={getTemperatureColor(weather.temperature)}
              fillOpacity={0.7}
              color="#000"
              weight={1}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{weather.location}</Typography>
                  <Typography variant="body2">🌡️ {weather.temperature.toFixed(1)}°C</Typography>
                  <Typography variant="body2">☁️ {weather.cloudCover.toFixed(0)}%</Typography>
                  <Typography variant="body2">💨 {weather.windSpeed.toFixed(1)} m/s</Typography>
                  <Typography variant="body2">
                    {title.includes('Christmas') ? '❄️' : '🌧️'} {weather.precipitation.toFixed(1)} mm
                  </Typography>
                </Box>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );

  const renderTransformationMap = () => (
    <Box flex="1" minWidth="300px">
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Transformation Details
      </Typography>
      <Box 
        sx={{ 
          height: '400px', 
          border: '2px solid #ccc', 
          borderRadius: '8px',
          padding: 2,
          backgroundColor: '#f5f5f5',
          overflowY: 'auto'
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Transformation Rules Applied:
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">• Temperature: -{TEMPERATURE_REDUCTION}°C (min {MIN_CHRISTMAS_TEMPERATURE}°C)</Typography>
          <Typography variant="body2">• Cloud Cover: minimum {MIN_CLOUD_COVER}%</Typography>
          <Typography variant="body2">• Wind Speed: ×{WIND_SPEED_MULTIPLIER}</Typography>
          <Typography variant="body2">• Precipitation: ×{PRECIPITATION_MULTIPLIER} (min {MIN_PRECIPITATION}mm)</Typography>
        </Box>

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
          Temperature Color Scale:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {[
            { temp: '< -15°C', color: '#0000FF', label: 'Deep Blue' },
            { temp: '-15 to -10°C', color: '#3366FF', label: 'Blue' },
            { temp: '-10 to -5°C', color: '#66B2FF', label: 'Light Blue' },
            { temp: '-5 to 0°C', color: '#99CCFF', label: 'Pale Blue' },
            { temp: '0 to 5°C', color: '#FFFF99', label: 'Pale Yellow' },
            { temp: '5 to 10°C', color: '#FFCC66', label: 'Light Orange' },
            { temp: '10 to 15°C', color: '#FF9933', label: 'Orange' },
            { temp: '> 15°C', color: '#FF6600', label: 'Red-Orange' },
          ].map((item, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: item.color,
                  border: '1px solid #000',
                  borderRadius: '50%',
                }}
              />
              <Typography variant="caption">{item.temp}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
          How to Use:
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          Click on the colored circles on each map to see detailed weather information for that city.
          The circle color indicates temperature based on the color scale above.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
        🎅 Christmas Weather Maps of Finland
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Interactive maps showing current weather and Christmas-transformed weather across Finland
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

      {!loading && currentWeatherData.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={3}>
          {renderWeatherMap(currentWeatherData, 'Current Weather', 'current-map')}
          {renderWeatherMap(christmasWeatherData, 'Christmas Weather ❄️🎄', 'christmas-map')}
          {renderTransformationMap()}
        </Box>
      )}
    </Box>
  );
};

export default ChristmasWeatherMaps;
