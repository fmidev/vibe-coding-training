import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import { getPositionData } from '../services/edrApi';
import { getActivitySuggestion } from '../utils/activitySuggestions';

// Finnish cities with coordinates
const FINNISH_CITIES = [
  { name: 'Helsinki', lat: 60.1699, lon: 24.9384 },
  { name: 'Turku', lat: 60.4518, lon: 22.2666 },
  { name: 'Tampere', lat: 61.4978, lon: 23.7610 },
  { name: 'Oulu', lat: 65.0121, lon: 25.4651 },
  { name: 'Jyväskylä', lat: 62.2426, lon: 25.7473 },
  { name: 'Lahti', lat: 60.9827, lon: 25.6612 },
  { name: 'Kuopio', lat: 62.8924, lon: 27.6782 },
  { name: 'Vaasa', lat: 63.0959, lon: 21.6164 },
  { name: 'Lappeenranta', lat: 61.0587, lon: 28.1887 },
  { name: 'Kotka', lat: 60.4664, lon: 26.9458 },
  { name: 'Rovaniemi', lat: 66.5039, lon: 25.7294 },
  { name: 'Ylläs', lat: 67.5833, lon: 24.1167 },
  { name: 'Levi', lat: 67.8067, lon: 24.8089 },
  { name: 'Inari', lat: 68.9069, lon: 27.0269 },
];

interface CityWeather {
  name: string;
  lat: number;
  lon: number;
  emoji?: string;
  activity?: string;
  temperature?: number;
  loading: boolean;
  error?: string;
}

const ActivityMap: React.FC = () => {
  const [citiesWeather, setCitiesWeather] = useState<CityWeather[]>(
    FINNISH_CITIES.map(city => ({ ...city, loading: true }))
  );
  const [hasError, setHasError] = useState(false);

  const loadDemoData = () => {
    // Generate demo data for all cities with varied conditions
    const demoWeather: CityWeather[] = FINNISH_CITIES.map((city, index) => {
      // Vary temperature based on latitude (colder in the north)
      const baseTempByLat = 20 - (city.lat - 60) * 2;
      const temperature = baseTempByLat + (Math.sin(index) * 5);
      
      // Vary weather symbols across cities
      const weatherSymbols = [1, 2, 3, 31, 51, 2, 1, 3, 31, 2, 51, 1, 51, 41];
      const weatherSymbol = weatherSymbols[index % weatherSymbols.length];
      
      const suggestion = getActivitySuggestion({
        weatherSymbol,
        temperature,
      });

      return {
        ...city,
        emoji: suggestion.emoji,
        activity: suggestion.activity,
        temperature,
        loading: false,
      };
    });

    setCitiesWeather(demoWeather);
    setHasError(false);
  };

  useEffect(() => {
    // Fetch weather for all cities
    const fetchWeatherForCities = async () => {
      const promises = FINNISH_CITIES.map(async (city) => {
        try {
          const now = new Date();
          const data = await getPositionData(
            'pal_skandinavia',
            `POINT(${city.lon} ${city.lat})`,
            {
              f: 'CoverageJSON',
              'parameter-name': 'WeatherSymbol3,Temperature',
              datetime: now.toISOString(),
            }
          ) as {
            ranges?: {
              temperature?: { values?: number[] };
              weathersymbol3?: { values?: number[] };
            };
          };

          if (data.ranges?.temperature?.values?.[0] !== undefined && 
              data.ranges?.weathersymbol3?.values?.[0] !== undefined) {
            const temperature = data.ranges.temperature.values[0];
            const weatherSymbol = data.ranges.weathersymbol3.values[0];
            
            const suggestion = getActivitySuggestion({
              weatherSymbol,
              temperature,
            });

            return {
              ...city,
              emoji: suggestion.emoji,
              activity: suggestion.activity,
              temperature,
              loading: false,
            };
          }
          
          return { ...city, loading: false, error: 'No data' };
        } catch (error) {
          console.error(`Error fetching weather for ${city.name}:`, error);
          return { ...city, loading: false, error: 'Failed to fetch' };
        }
      });

      const results = await Promise.all(promises);
      const allFailed = results.every(r => r.error);
      
      if (allFailed) {
        setHasError(true);
      } else {
        setCitiesWeather(results);
      }
    };

    fetchWeatherForCities();
  }, []);

  // Create custom icon for each city with emoji
  const createEmojiIcon = (emoji: string) => {
    return new DivIcon({
      html: `<div style="font-size: 32px; text-align: center;">${emoji}</div>`,
      className: 'emoji-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {hasError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Unable to fetch live weather data. Click below to load demo data.
          <Button 
            variant="contained" 
            size="small"
            onClick={loadDemoData}
            sx={{ ml: 2 }}
          >
            Load Demo Data
          </Button>
        </Alert>
      )}
      
      <Box sx={{ height: '600px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={[64.5, 26.0]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {citiesWeather.map((city) => (
          <Marker
            key={city.name}
            position={[city.lat, city.lon]}
            icon={city.emoji ? createEmojiIcon(city.emoji) : new Icon.Default()}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {city.name}
                </Typography>
                {city.loading ? (
                  <CircularProgress size={20} />
                ) : city.error ? (
                  <Typography variant="body2" color="error">
                    {city.error}
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {city.emoji}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {city.activity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {city.temperature?.toFixed(1)}°C
                    </Typography>
                  </>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      </Box>
    </Box>
  );
};

export default ActivityMap;
