import { useState, useEffect, useCallback } from 'react';
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
  Link,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CloudQueue, Code, GitHub, BugReport, LocationOn } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { getPositionData } from './services/edrApi';

// 10 biggest cities in Finland with their coordinates
interface City {
  name: string;
  coords: string; // Format: "POINT(lon lat)"
  population: number;
}

const FINNISH_CITIES: City[] = [
  { name: 'Helsinki', coords: 'POINT(24.9384 60.1699)', population: 656920 },
  { name: 'Espoo', coords: 'POINT(24.6522 60.2055)', population: 292796 },
  { name: 'Tampere', coords: 'POINT(23.7610 61.4978)', population: 244315 },
  { name: 'Vantaa', coords: 'POINT(25.0378 60.2934)', population: 237434 },
  { name: 'Oulu', coords: 'POINT(25.4714 65.0121)', population: 208939 },
  { name: 'Turku', coords: 'POINT(22.2666 60.4518)', population: 194391 },
  { name: 'Jyväskylä', coords: 'POINT(25.7209 62.2426)', population: 143420 },
  { name: 'Lahti', coords: 'POINT(25.6612 60.9827)', population: 119984 },
  { name: 'Kuopio', coords: 'POINT(27.6782 62.8924)', population: 120105 },
  { name: 'Pori', coords: 'POINT(21.7974 61.4847)', population: 83809 },
];

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
  const [selectedCity, setSelectedCity] = useState<City>(FINNISH_CITIES[0]); // Default to Helsinki

  console.log('App state:', { hasWeatherData: !!weatherData, loading, error, selectedCity: selectedCity.name });

  const fetchExampleWeatherData = useCallback(async (city: City = selectedCity) => {
    setLoading(true);
    setError(null);
    try {
      // Get current time and 24 hours from now
      const now = new Date();
      const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Format dates to ISO string for API
      const startTime = now.toISOString();
      const endTime = twentyFourHoursLater.toISOString();
      
      const data = await getPositionData(
        'pal_skandinavia',
        city.coords,
        {
          f: 'CoverageJSON',
          'parameter-name': 'Temperature',
          datetime: `${startTime}/${endTime}`,
        }
      ) as CoverageJSONResponse;
      
      // Log the actual data structure to understand the format
      console.log('Weather data received:', data);
      if (data.ranges) {
        console.log('Sample range value:', Object.keys(data.ranges)[0], data.ranges[Object.keys(data.ranges)[0]]);
      }
      
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      
      // Use mock data for demonstration when API is not accessible
      const now = new Date();
      const mockTimeValues: string[] = [];
      const mockTempValues: number[] = [];
      
      // Generate 24 hours of mock data (hourly intervals)
      for (let i = 0; i < 24; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        mockTimeValues.push(time.toISOString());
        // Generate realistic temperature curve (sine wave between 0-15°C)
        mockTempValues.push(7.5 + 7.5 * Math.sin((i / 24) * 2 * Math.PI - Math.PI / 2));
      }
      
      const mockData: CoverageJSONResponse = {
        type: 'Coverage',
        domain: {
          axes: {
            t: { values: mockTimeValues }
          }
        },
        parameters: {
          Temperature: {
            description: { fi: 'Lämpötila' },
            unit: {
              label: { fi: 'Celsius' },
              symbol: '°C'
            }
          }
        },
        ranges: {
          Temperature: {
            values: mockTempValues
          }
        }
      };
      
      setWeatherData(mockData);
      setError('Using mock data for demonstration - API not accessible');
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    // Fetch weather data after a short delay to ensure page renders first
    const timer = setTimeout(() => {
      fetchExampleWeatherData(selectedCity);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedCity, fetchExampleWeatherData]); // Re-fetch when city changes

  const handleCityChange = (event: { target: { value: string } }) => {
    const city = FINNISH_CITIES.find(c => c.name === event.target.value);
    if (city) {
      setSelectedCity(city);
    }
  };

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
          {/* Welcome Section */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Welcome to Vibe Coding Training! 🚀
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Let's build an awesome weather application together using FMI Open Data!
            </Typography>
          </Box>

          {/* Getting Started Card */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                🎯 Getting Started with Vibe Coding
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                <strong>Vibe Coding</strong> is a collaborative development approach where you create issues for features
                you want to implement, and then work on them iteratively. Here's how to get started:
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="1. Create an Issue"
                    secondary="Go to the GitHub repository Issues tab and create a new issue describing a feature you want to add to the weather app"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="2. Describe Your Feature"
                    secondary="Be specific about what you want to build. For example: 'Add a component to display current temperature for a location' or 'Create a 7-day weather forecast view'"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="3. Use GitHub Copilot"
                    secondary="Assign the issue to GitHub Copilot - the coding agent will create a pull request with the implementation plan and code changes"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="4. Review and Preview"
                    secondary="View the pull request to see the plan and changes. Each PR is automatically deployed to Firebase Hosting for preview (requires approving the workflow run)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="5. Iterate and Improve"
                    secondary="Respond to feedback and continue improving your weather app!"
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<GitHub />}
                  href="https://github.com/fmidev/vibe-coding-training/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create Your First Issue
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Code />}
                  href="https://github.com/fmidev/vibe-coding-training/pulls"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Pull Requests
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BugReport />}
                  href="https://github.com/fmidev/vibe-coding-training/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View All Issues
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Weather App Ideas Card */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                💡 Weather App Feature Ideas
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                Not sure what to build? Here are some ideas to get you started:
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Current Weather Display"
                    secondary="Show real-time weather data for a specific location (temperature, cloud cover, humidity, wind speed)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Location Search"
                    secondary="Add ability to search for different cities or coordinates to view their weather"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Weather Forecast"
                    secondary="Display 5-day or 7-day weather forecast with daily temperatures and conditions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Weather Charts"
                    secondary="Visualize temperature trends, precipitation, or wind speed over time using charts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Weather Alerts"
                    secondary="Show weather warnings or alerts for extreme conditions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Favorite Locations"
                    secondary="Allow users to save and quickly access weather for their favorite places"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Weather Map"
                    secondary="Display weather data on an interactive map showing temperature or precipitation across Scandinavia"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* FMI Open Data API Card */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                🌐 FMI Open Data - OGC EDR 1.1 API
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                This application uses the Finnish Meteorological Institute's Open Data API following the
                OGC Environmental Data Retrieval (EDR) 1.1 standard. The API provides access to weather
                forecasts and observations.
              </Typography>

              <Typography variant="body2" paragraph>
                <strong>API Endpoint:</strong>{' '}
                <Link href="https://opendata.fmi.fi/edr" target="_blank" rel="noopener noreferrer">
                  https://opendata.fmi.fi/edr
                </Link>
              </Typography>

              <Typography variant="body2" paragraph>
                <strong>Default Collection:</strong> pal_skandinavia (MEPS model for Scandinavia)
              </Typography>

              <Typography variant="body2" paragraph>
                <strong>Collection Metadata:</strong>{' '}
                <Link 
                  href="https://opendata.fmi.fi/edr/collections/pal_skandinavia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  https://opendata.fmi.fi/edr/collections/pal_skandinavia
                </Link>
              </Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Example API Query
              </Typography>
              <Typography variant="body2" paragraph>
                Here's an example of how to get a 24-hour temperature forecast for {selectedCity.name}, Finland:
              </Typography>
              <Box
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                }}
              >
                https://opendata.fmi.fi/edr/collections/pal_skandinavia/position?<br />
                f=CoverageJSON&<br />
                parameter-name=Temperature&<br />
                datetime=[current_time]/[current_time+24h]&<br />
                coords={selectedCity.coords}
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Temperature Chart - 24 Hour Forecast
              </Typography>
              
              {/* Location Selection */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="city-select-label">
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                    Select City
                  </InputLabel>
                  <Select
                    labelId="city-select-label"
                    id="city-select"
                    value={selectedCity.name}
                    label="Select City"
                    onChange={handleCityChange}
                    disabled={loading}
                  >
                    {FINNISH_CITIES.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name} ({city.population.toLocaleString()} residents)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Typography variant="body2" paragraph>
                Live 24-hour temperature forecast data from the API for {selectedCity.name}, Finland:
              </Typography>

              {loading && (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              )}

              {error && weatherData && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {error && !weatherData && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Unable to fetch live data from the API. This could be due to network restrictions or the API being temporarily unavailable.
                  When the API is accessible, you'll see a chart here with real-time temperature data over 24 hours.
                </Alert>
              )}

              {weatherData && !loading && (() => {
                // Find the temperature parameter key (case-insensitive)
                const tempKey = Object.keys(weatherData.ranges).find(
                  key => key.toLowerCase() === 'temperature'
                ) || 'Temperature';
                const temperatureData = weatherData.ranges[tempKey];
                
                if (!temperatureData || !temperatureData.values) {
                  return (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Unable to display chart: Temperature data is missing from the API response.
                    </Alert>
                  );
                }
                
                return (
                  <>
                    <Box sx={{ width: '100%', height: 400, mb: 2 }}>
                      <LineChart
                        xAxis={[{
                          data: weatherData.domain.axes.t.values.map(time => new Date(time)),
                          scaleType: 'time',
                          label: 'Time',
                          valueFormatter: (date) => new Date(date).toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }),
                        }]}
                        yAxis={[{
                          label: 'Temperature (°C)',
                        }]}
                        series={[
                          {
                            data: temperatureData.values,
                            label: 'Temperature',
                            color: '#1976d2',
                            curve: 'linear',
                            showMark: false,
                          },
                        ]}
                        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                        grid={{ vertical: true, horizontal: true }}
                      />
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => fetchExampleWeatherData(selectedCity)}
                      disabled={loading}
                    >
                      Refresh Data
                    </Button>
                  </>
                );
              })()}

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Available Parameters
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Temperature" secondary="Air temperature in Celsius" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="TotalCloudCover" secondary="Cloud coverage percentage" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="WindSpeedMS" secondary="Wind speed in meters per second" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="WindDirection" secondary="Wind direction in degrees" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Precipitation1h" secondary="Hourly precipitation in mm" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Humidity" secondary="Relative humidity percentage" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="PoP" secondary="Probability of precipitation" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="DewPoint" secondary="Dew point temperature in Celsius" />
                </ListItem>
              </List>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Code />}
                  href="https://docs.ogc.org/is/19-086r6/19-086r6.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OGC EDR 1.1 Specification
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Code />}
                  href="https://www.ilmatieteenlaitos.fi/avoin-data"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FMI Open Data Documentation
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                📚 Helpful Resources
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link href="https://react.dev" target="_blank" rel="noopener noreferrer">
                        React Documentation
                      </Link>
                    }
                    secondary="Learn about React hooks, components, and best practices"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link href="https://mui.com" target="_blank" rel="noopener noreferrer">
                        Material UI Documentation
                      </Link>
                    }
                    secondary="Explore UI components and design patterns"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener noreferrer">
                        TypeScript Documentation
                      </Link>
                    }
                    secondary="Master TypeScript types and interfaces"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                        Vite Documentation
                      </Link>
                    }
                    secondary="Understand the build tool and development server"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Happy Coding! 🎉 Remember: Start small, iterate often, and have fun building your weather app!
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
