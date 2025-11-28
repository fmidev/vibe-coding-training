import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ThermostatAuto } from '@mui/icons-material';
import { getPositionData } from '../services/edrApi';
import type { CoverageJSONResponse } from '../types/weather';

// Refresh interval in milliseconds (30 minutes)
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

interface ForecastData {
  time: string;
  temperature: number;
}

const TemperatureForecast = () => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      // Helsinki coordinates: 24.94°E, 60.17°N
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const datetimeRange = `${now.toISOString()}/${tomorrow.toISOString()}`;

      const data = await getPositionData(
        'pal_skandinavia',
        'POINT(24.94 60.17)',
        {
          f: 'CoverageJSON',
          'parameter-name': 'Temperature',
          datetime: datetimeRange,
        }
      ) as CoverageJSONResponse;

      // Validate response has required data
      if (!data || !data.ranges || !data.domain?.axes?.t) {
        throw new Error('Invalid response from weather API');
      }

      // Extract forecast data
      const times = data.domain.axes.t.values;
      const temperatures = data.ranges.Temperature?.values || [];

      const forecast: ForecastData[] = times.map((time, index) => ({
        time,
        temperature: temperatures[index] ?? 0,
      }));

      setForecastData(forecast);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast data');
      console.error('Error fetching forecast data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    // Refresh every 30 minutes
    const interval = setInterval(fetchForecast, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading && forecastData.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && forecastData.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('fi-FI', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Find min and max temperatures
  const temperatures = forecastData.map(f => f.temperature);
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            <ThermostatAuto sx={{ mr: 1, verticalAlign: 'middle' }} />
            24-Hour Temperature Forecast for Helsinki
          </Typography>
          {loading && forecastData.length > 0 && (
            <CircularProgress size={20} />
          )}
        </Box>
        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {forecastData.length > 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Minimum Temperature
                </Typography>
                <Typography variant="h4" color="primary">
                  {minTemp.toFixed(1)}°C
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Maximum Temperature
                </Typography>
                <Typography variant="h4" color="error">
                  {maxTemp.toFixed(1)}°C
                </Typography>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                      Time
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="right">
                      Temperature
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forecastData.map((forecast, index) => {
                    const isCurrentHour = index === 0;
                    return (
                      <TableRow
                        key={forecast.time}
                        hover
                        sx={{
                          bgcolor: isCurrentHour ? 'action.selected' : 'inherit',
                        }}
                      >
                        <TableCell>
                          {formatTime(forecast.time)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            component="span"
                            fontWeight={isCurrentHour ? 'bold' : 'normal'}
                            color={
                              forecast.temperature < 0
                                ? 'info.main'
                                : forecast.temperature > 20
                                ? 'error.main'
                                : 'text.primary'
                            }
                          >
                            {forecast.temperature.toFixed(1)}°C
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Data source: FMI Open Data (PAL Skandinavia collection)
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TemperatureForecast;
