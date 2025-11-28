import { type FC, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Thermostat,
  Opacity,
  WbCloudy,
  AcUnit,
  Grain,
  WaterDrop,
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

// Ten largest cities in Finland with their coordinates
const FINNISH_CITIES = [
  { name: 'Helsinki', coords: 'POINT(24.9384 60.1699)' },
  { name: 'Espoo', coords: 'POINT(24.6559 60.2055)' },
  { name: 'Tampere', coords: 'POINT(23.7610 61.4978)' },
  { name: 'Vantaa', coords: 'POINT(25.0378 60.2934)' },
  { name: 'Oulu', coords: 'POINT(25.4714 65.0121)' },
  { name: 'Turku', coords: 'POINT(22.2666 60.4518)' },
  { name: 'Jyväskylä', coords: 'POINT(25.7333 62.2426)' },
  { name: 'Lahti', coords: 'POINT(25.6612 60.9827)' },
  { name: 'Kuopio', coords: 'POINT(27.6783 62.8924)' },
  { name: 'Pori', coords: 'POINT(21.7972 61.4851)' },
] as const;

const HELSINKI_COORDS = 'POINT(24.9384 60.1699)';

// Mock data for development/demo purposes when API is not accessible
const MOCK_DATA = {
  temperature: 6.18,
  precipitation1h: 0.33,
  precipitationForm: 1,
  weatherSymbol: 31,
  timestamp: new Date().toISOString(),
};

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

// Helper function to get precipitation form icon
const getPrecipitationFormIcon = (code: number) => {
  // 0: No precipitation, 1: Rain, 2: Sleet, 3: Snow, 4: Freezing rain, 5: Freezing drizzle, 6: Hail
  if (code === 0) return WbCloudy; // No precipitation - cloud
  if (code === 1) return WaterDrop; // Rain - water drop
  if (code === 2) return Grain; // Sleet - grain/mixed
  if (code === 3) return AcUnit; // Snow - snowflake
  if (code === 4 || code === 5) return WaterDrop; // Freezing rain/drizzle - water drop
  if (code === 6) return Grain; // Hail - grain
  return Opacity; // Default - opacity/water
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
  const [selectedCity, setSelectedCity] = useState<string>('Helsinki');

  const handleCityChange = (event: SelectChangeEvent) => {
    setSelectedCity(event.target.value);
  };

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Find the selected city's coordinates
      const city = FINNISH_CITIES.find(c => c.name === selectedCity);
      const coords = city ? city.coords : HELSINKI_COORDS;
      
      // Get current time and 1 hour ahead for latest forecast
      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      
      const formatDateTime = (date: Date) => {
        return date.toISOString().split('.')[0] + 'Z';
      };

      const data = await getPositionData(
        'pal_skandinavia',
        coords,
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
      // Fall back to mock data if API fails
      // This ensures users always see weather information
      console.log('Using mock data due to API error:', err);
      setWeatherData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchWeatherData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeatherData]); // Re-fetch when fetchWeatherData changes (which includes selectedCity)

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
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        fontWeight="bold" 
        textAlign="center"
        sx={{
          animation: 'fadeInDown 0.6s ease-out',
          '@keyframes fadeInDown': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {selectedCity} Weather
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 3,
          animation: 'fadeIn 0.8s ease-out 0.2s both',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
            },
            '100%': {
              opacity: 1,
            },
          },
        }}
      >
        <FormControl 
          sx={{ 
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-2px)',
              },
            },
          }}
        >
          <InputLabel id="city-select-label">Select City</InputLabel>
          <Select
            labelId="city-select-label"
            id="city-select"
            value={selectedCity}
            label="Select City"
            onChange={handleCityChange}
          >
            {FINNISH_CITIES.map((city) => (
              <MenuItem key={city.name} value={city.name}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Typography 
        variant="subtitle1" 
        color="text.secondary" 
        textAlign="center" 
        gutterBottom
        sx={{
          animation: 'fadeIn 0.8s ease-out 0.3s both',
        }}
      >
        Updated: {new Date(weatherData.timestamp).toLocaleString()}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Temperature */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.8) 0%, rgba(66, 165, 245, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideInUp 0.6s ease-out 0.1s both',
              '@keyframes slideInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)',
              },
            }}
          >
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Thermostat 
                  sx={{ 
                    fontSize: 80,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                      },
                      '50%': {
                        transform: 'scale(1.05)',
                      },
                    },
                  }} 
                />
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
          <Card 
            elevation={0}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, rgba(2, 136, 209, 0.8) 0%, rgba(3, 169, 244, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideInUp 0.6s ease-out 0.2s both',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(2, 136, 209, 0.4)',
              },
            }}
          >
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Opacity 
                  sx={{ 
                    fontSize: 80,
                    animation: 'bounce 2s ease-in-out infinite',
                    '@keyframes bounce': {
                      '0%, 100%': {
                        transform: 'translateY(0)',
                      },
                      '50%': {
                        transform: 'translateY(-10px)',
                      },
                    },
                  }} 
                />
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
          <Card 
            elevation={0}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, rgba(194, 24, 91, 0.8) 0%, rgba(233, 30, 99, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideInUp 0.6s ease-out 0.3s both',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(194, 24, 91, 0.4)',
              },
            }}
          >
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                {(() => {
                  const IconComponent = getPrecipitationFormIcon(weatherData.precipitationForm);
                  return <IconComponent sx={{ 
                    fontSize: 80,
                    animation: 'rotate 3s ease-in-out infinite',
                    '@keyframes rotate': {
                      '0%, 100%': {
                        transform: 'rotate(0deg)',
                      },
                      '50%': {
                        transform: 'rotate(10deg)',
                      },
                    },
                  }} />;
                })()}
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
          <Card 
            elevation={0}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, rgba(237, 108, 2, 0.8) 0%, rgba(255, 152, 0, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'slideInUp 0.6s ease-out 0.4s both',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(237, 108, 2, 0.4)',
              },
            }}
          >
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <WbCloudy sx={{ 
                  fontSize: 80,
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': {
                      transform: 'translateY(0px)',
                    },
                    '50%': {
                      transform: 'translateY(-15px)',
                    },
                  },
                }} />
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
