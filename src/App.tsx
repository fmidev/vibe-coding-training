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
  Link,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudQueue, Code, GitHub, BugReport } from '@mui/icons-material';
import { getPositionData } from './services/edrApi';
import HelsinkiWeather from './components/HelsinkiWeather';

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
      const data = await getPositionData(
        'pal_skandinavia',
        'POINT(10.752 59.913)',
        {
          f: 'CoverageJSON',
          'parameter-name': 'Temperature,WindSpeedMS,TotalCloudCover',
          datetime: '2025-11-28T12:00:00Z/2025-11-28T15:00:00Z',
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
          {/* Helsinki Weather Display */}
          <HelsinkiWeather />

          <Divider sx={{ my: 4 }} />

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
                Here's an example of how to get a 3-hour weather forecast for Oslo, Norway:
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
                parameter-name=Temperature,WindSpeedMS,TotalCloudCover&<br />
                datetime=2025-11-28T12:00:00Z/2025-11-28T15:00:00Z&<br />
                coords=POINT(10.752 59.913)
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Example Response
              </Typography>
              <Typography variant="body2" paragraph>
                Live data from the API showing 3-hour forecast for Oslo, Norway:
              </Typography>

              {loading && (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              )}

              {error && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Unable to fetch live data from the API. This could be due to network restrictions or the API being temporarily unavailable.
                  When the API is accessible, you'll see a table here with real-time weather parameters and their values.
                </Alert>
              )}

              {weatherData && !loading && (
                <>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time (UTC)</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Parameter</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Value</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Unit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          const timeValues = weatherData.domain.axes.t.values;
                          const parameterKeys = Object.keys(weatherData.ranges);
                          const rows: React.ReactElement[] = [];
                          
                          // Iterate through each time step
                          timeValues.forEach((time, timeIndex) => {
                            // For each time, show all parameters
                            parameterKeys.forEach((paramKey) => {
                              const param = weatherData.parameters[paramKey];
                              const rangeValue = weatherData.ranges[paramKey].values[timeIndex];
                              
                              // Extract unit symbol
                              let unit = '';
                              if (param?.unit?.symbol) {
                                const symbol = param.unit.symbol;
                                if (typeof symbol === 'string') {
                                  unit = symbol;
                                } else if (typeof symbol === 'object' && symbol.value) {
                                  unit = symbol.value;
                                }
                              }
                              
                              // Format the value
                              const displayValue = typeof rangeValue === 'number' 
                                ? rangeValue.toFixed(1) 
                                : String(rangeValue ?? 'N/A');
                              
                              // Format parameter name
                              const displayParamName = paramKey
                                .replace(/([A-Z])/g, ' $1')
                                .trim()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                              
                              rows.push(
                                <TableRow key={`${time}-${paramKey}`} hover>
                                  <TableCell>{new Date(time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                  <TableCell>{displayParamName}</TableCell>
                                  <TableCell>{displayValue}</TableCell>
                                  <TableCell>{unit}</TableCell>
                                </TableRow>
                              );
                            });
                          });
                          
                          return rows;
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={fetchExampleWeatherData}
                    disabled={loading}
                  >
                    Refresh Data
                  </Button>
                </>
              )}

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
