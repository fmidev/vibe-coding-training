import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { ThermostatAuto } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getPositionData } from '../services/edrApi';
import type { CoverageJSONResponse } from '../types/weather';

// Refresh interval in milliseconds (30 minutes)
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

interface TemperaturePoint {
  time: string;
  temperature: number;
  hour: string;
}

const TemperatureChart = () => {
  const [chartData, setChartData] = useState<TemperaturePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemperatureForecast = async () => {
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

      // Extract temperature data
      const times = data.domain.axes.t.values;
      const temperatures = data.ranges.temperature?.values || data.ranges.Temperature?.values || [];

      const tempData: TemperaturePoint[] = times.map((time, index) => {
        const date = new Date(time);
        return {
          time,
          temperature: temperatures[index] ?? 0,
          hour: date.toLocaleTimeString('en-FI', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      });

      setChartData(tempData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch temperature data');
      console.error('Error fetching temperature data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatureForecast();
    // Refresh every 30 minutes
    const interval = setInterval(fetchTemperatureForecast, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading && chartData.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  // Calculate min and max temperatures for display
  const temperatures = chartData.map(d => d.temperature);
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            <ThermostatAuto sx={{ mr: 1, verticalAlign: 'middle' }} />
            24-Hour Temperature Forecast for Helsinki
          </Typography>
          {loading && chartData.length > 0 && (
            <CircularProgress size={20} />
          )}
        </Box>
        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {chartData.length > 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Minimum
                </Typography>
                <Typography variant="h5" color="info.main">
                  {minTemp.toFixed(1)}°C
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Maximum
                </Typography>
                <Typography variant="h5" color="error.main">
                  {maxTemp.toFixed(1)}°C
                </Typography>
              </Box>
            </Box>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  label={{ value: 'Time (UTC+2)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                  domain={[
                    (dataMin: number) => Math.floor(dataMin - 1),
                    (dataMax: number) => Math.ceil(dataMax + 1),
                  ]}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)}°C`, 'Temperature']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#1976d2"
                  strokeWidth={2}
                  dot={{ fill: '#1976d2', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Temperature (°C)"
                />
              </LineChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Data source: FMI Open Data (PAL Skandinavia collection) • Updates every 30 minutes
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TemperatureChart;
