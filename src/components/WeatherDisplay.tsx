import type { FC } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Fade,
  Grow,
  Chip,
  Stack,
} from '@mui/material';
import {
  Thermostat,
  Air,
  Navigation,
  WaterDrop,
  Cloud,
} from '@mui/icons-material';
import type { WeatherData } from '../types/weather';

interface WeatherDisplayProps {
  cityName: string;
  weatherData: WeatherData;
  loading?: boolean;
}

const WeatherDisplay: FC<WeatherDisplayProps> = ({
  cityName,
  weatherData,
  loading = false,
}) => {
  const getWindDirectionRotation = (degrees?: number): number => {
    return degrees !== undefined ? degrees : 0;
  };

  const formatTemperature = (temp?: number): string => {
    return temp !== undefined ? `${temp.toFixed(1)}°C` : 'N/A';
  };

  const formatWindSpeed = (speed?: number): string => {
    return speed !== undefined ? `${speed.toFixed(1)} m/s` : 'N/A';
  };

  const formatPrecipitation = (precip?: number): string => {
    return precip !== undefined ? `${precip.toFixed(1)} mm` : 'N/A';
  };

  const formatPoP = (pop?: number): string => {
    return pop !== undefined ? `${Math.round(pop)}%` : 'N/A';
  };

  if (loading) {
    return null;
  }

  return (
    <Fade in timeout={1000}>
      <Box sx={{ mt: 20, mb: 4 }}>
        <Grow in timeout={800}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
            }}
          >
            {cityName}
          </Typography>
        </Grow>

        <Grid container spacing={3}>
          {/* Current Temperature - Large Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grow in timeout={1000}>
              <Card
                elevation={6}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Thermostat sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h6">Temperature</Typography>
                  </Box>
                  <Typography variant="h2" component="div" fontWeight="bold">
                    {formatTemperature(weatherData.temperature)}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Wind Speed & Direction */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grow in timeout={1100}>
              <Card
                elevation={6}
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Air sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h6">Wind</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h3" component="div" fontWeight="bold">
                      {formatWindSpeed(weatherData.windSpeedMS)}
                    </Typography>
                    <Navigation
                      sx={{
                        fontSize: 50,
                        transform: `rotate(${getWindDirectionRotation(
                          weatherData.windDirection
                        )}deg)`,
                        transition: 'transform 0.5s ease-in-out',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Direction: {weatherData.windDirection?.toFixed(0)}°
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Precipitation */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Grow in timeout={1200}>
              <Card
                elevation={6}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <WaterDrop sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h6">Precipitation (1h)</Typography>
                  </Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {formatPrecipitation(weatherData.precipitation1h)}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Probability of Precipitation */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Grow in timeout={1300}>
              <Card
                elevation={6}
                sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Cloud sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h6">Precipitation Prob.</Typography>
                  </Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {formatPoP(weatherData.pop)}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Hourly Temperature Forecast */}
          {weatherData.hourlyTemperatures &&
            weatherData.hourlyTemperatures.length > 0 && (
              <Grid size={{ xs: 12, md: 4 }}>
                <Grow in timeout={1400}>
                  <Card
                    elevation={6}
                    sx={{
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ color: 'text.primary' }}
                      >
                        Next {weatherData.hourlyTemperatures.length} Hours
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          overflowX: 'auto',
                          '&::-webkit-scrollbar': {
                            height: 6,
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 3,
                          },
                        }}
                      >
                        {weatherData.hourlyTemperatures.map((item, index) => {
                          const date = new Date(item.time);
                          const hour = date.toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          return (
                            <Chip
                              key={index}
                              label={`${hour}: ${item.temperature.toFixed(1)}°C`}
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                minWidth: '90px',
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            )}
        </Grid>
      </Box>
    </Fade>
  );
};

export default WeatherDisplay;
