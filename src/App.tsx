import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import { getPositionData } from './services/edrApi';
import { getActivitySuggestion } from './utils/activitySuggestions';
import ActivityMap from './components/ActivityMap';

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

console.log('App.tsx module loaded');

function App() {
  console.log('App() function called - rendering component');
  const [weatherData, setWeatherData] = useState<CoverageJSONResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('App state:', { hasWeatherData: !!weatherData, loading, error });

  const fetchExampleWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current time and 24 hours ahead
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const datetimeRange = `${now.toISOString()}/${tomorrow.toISOString()}`;
      
      const data = await getPositionData(
        'pal_skandinavia',
        'POINT(10.752 59.913)',
        {
          f: 'CoverageJSON',
          'parameter-name': 'WeatherSymbol3,Temperature,Precipitation1h',
          datetime: datetimeRange,
        }
      ) as CoverageJSONResponse;
      
      // Log the actual data structure to understand the format
      console.log('Weather data received:', data);
      if (data.ranges) {
        console.log('Sample range value:', Object.keys(data.ranges)[0], data.ranges[Object.keys(data.ranges)[0]]);
      }
      
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // Generate 24 hours of demo data
    const now = new Date();
    const timeValues = [];
    const temperatures = [];
    const weatherSymbols = [];
    const precipitations = [];
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      timeValues.push(time.toISOString());
      
      // Vary temperature throughout the day
      const temp = 15 + 10 * Math.sin((i - 6) * Math.PI / 12);
      temperatures.push(temp);
      
      // Vary weather conditions
      let symbol = 1; // sunny
      if (i >= 6 && i < 9) symbol = 2; // partly cloudy
      else if (i >= 9 && i < 12) symbol = 3; // cloudy
      else if (i >= 12 && i < 15) symbol = 31; // light rain
      else if (i >= 15 && i < 18) symbol = 51; // light snow
      else if (i >= 18 && i < 21) symbol = 2; // partly cloudy
      weatherSymbols.push(symbol);
      
      // Precipitation
      const precip = (symbol >= 31 && symbol <= 53) ? 2.0 : 0;
      precipitations.push(precip);
    }
    
    const demoData: CoverageJSONResponse = {
      type: 'Coverage',
      domain: {
        axes: {
          t: { values: timeValues }
        }
      },
      parameters: {
        temperature: {
          unit: { symbol: '°C' }
        },
        weathersymbol3: {
          unit: { symbol: '' }
        },
        precipitation1h: {
          unit: { symbol: 'mm' }
        }
      },
      ranges: {
        temperature: { values: temperatures },
        weathersymbol3: { values: weatherSymbols },
        precipitation1h: { values: precipitations }
      }
    };
    setWeatherData(demoData);
    setError(null);
  };

  useEffect(() => {
    // Fetch weather data after a short delay to ensure page renders first
    const timer = setTimeout(() => {
      fetchExampleWeatherData();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vibe Coding Training - Weather App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={4}>
          {/* Activity Map Widget */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🗺️ Finland Activity Map
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                Activity suggestions for major cities across Finland based on current weather
              </Typography>
              <ActivityMap />
            </CardContent>
          </Card>

          {/* Activity Forecast Widget */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 24-Hour Activity Forecast
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {loading && (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              )}

              {error && (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Unable to fetch live weather data. Click below to load demo data.
                  </Alert>
                  <Button 
                    variant="contained" 
                    onClick={loadDemoData}
                  >
                    Load Demo Data
                  </Button>
                </>
              )}

              {weatherData && !loading && (
                <Stack spacing={2}>
                  {(() => {
                    const timeValues = weatherData.domain.axes.t.values;
                    const activities: React.ReactElement[] = [];
                    
                    // Get temperature and weather symbol for each time
                    timeValues.forEach((time, timeIndex) => {
                      const temperature = weatherData.ranges.temperature?.values[timeIndex];
                      const weatherSymbol = weatherData.ranges.weathersymbol3?.values[timeIndex];
                      const precipitation = weatherData.ranges.precipitation1h?.values[timeIndex];
                      
                      if (temperature !== undefined && weatherSymbol !== undefined && 
                          !isNaN(temperature) && !isNaN(weatherSymbol)) {
                        const suggestion = getActivitySuggestion({
                          weatherSymbol,
                          temperature,
                          precipitation,
                        });
                        
                        activities.push(
                          <Box
                            key={time}
                            sx={{
                              p: 2,
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography variant="h4">{suggestion.emoji}</Typography>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  {new Date(time).toLocaleString('en-GB', { 
                                    weekday: 'short',
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - {temperature.toFixed(1)}°C
                                </Typography>
                                <Typography variant="h6">{suggestion.activity}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {suggestion.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        );
                      }
                    });
                    
                    return activities;
                  })()}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
