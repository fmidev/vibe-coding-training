import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
import {
  getSynopObservations,
  getStationInfo,
  type SynopObservation,
} from '../services/ogimetApi';

interface ChartDataPoint {
  time: string;
  temperature?: number;
  precipitation?: number;
}

const SynopWeatherView: React.FC = () => {
  const [wmoIndex, setWmoIndex] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [observations, setObservations] = useState<SynopObservation[]>([]);

  const currentStation = getStationInfo(wmoIndex);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSynopObservations(wmoIndex, startDate, endDate);
      if (data.length === 0) {
        setError('No observations found for the specified date range');
      }
      setObservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch synoptic observations');
      console.error('Error fetching SYNOP data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData: ChartDataPoint[] = observations.map((obs) => ({
    time: obs.timestamp.toLocaleTimeString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    temperature: obs.temperature,
    precipitation: obs.precipitation,
  }));

  // Filter data for charts (only include points with data)
  const temperatureData = chartData.filter((d) => d.temperature !== undefined);
  const precipitationData = chartData.filter((d) => d.precipitation !== undefined);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            Synoptic Weather Observations
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Fetch temperature and precipitation observations from Ogimet by WMO station index
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="WMO Station Index"
                value={wmoIndex}
                onChange={(e) => setWmoIndex(e.target.value)}
                placeholder="Enter WMO index (e.g., 01098 for Vardø)"
                fullWidth
                helperText="Enter a 5-digit WMO station index"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DateTimePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => newValue && setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DateTimePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => newValue && setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleFetchData}
                disabled={loading || !wmoIndex}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Fetch Observations'}
              </Button>
            </Stack>
          </Box>

          {currentStation && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Station: {currentStation.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Location: {currentStation.country}
                {currentStation.latitude && currentStation.longitude && (
                  <> ({Math.abs(currentStation.latitude).toFixed(2)}°{currentStation.latitude >= 0 ? 'N' : 'S'}, {Math.abs(currentStation.longitude).toFixed(2)}°{currentStation.longitude >= 0 ? 'E' : 'W'})</>
                )}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {observations.length > 0 && !loading && (
            <Stack spacing={3} sx={{ mt: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Temperature Time Series
                </Typography>
                {temperatureData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        style={{ fontSize: '0.75rem' }}
                      />
                      <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ff6b6b"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Temperature (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Alert severity="info">No temperature data available for this period</Alert>
                )}
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Precipitation Time Series
                </Typography>
                {precipitationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={precipitationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        style={{ fontSize: '0.75rem' }}
                      />
                      <YAxis label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="precipitation"
                        stroke="#4dabf7"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Precipitation (mm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Alert severity="info">No precipitation data available for this period</Alert>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Found {observations.length} observations from {startDate.toLocaleDateString()} to{' '}
                  {endDate.toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default SynopWeatherView;
