import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
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
import type { ObservationPoint } from '../services/weatherService';

interface ObservationsChartProps {
  observations: ObservationPoint[] | null;
  loading: boolean;
  error: string | null;
}

const ObservationsChart: React.FC<ObservationsChartProps> = ({
  observations,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            2-Day Temperature History
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            2-Day Temperature History
          </Typography>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!observations || observations.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            2-Day Temperature History
          </Typography>
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No observation data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = observations.map((obs) => {
    const date = new Date(obs.timestamp);
    return {
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
      temperature: Number(obs.temperature.toFixed(1)),
      windSpeed: obs.windSpeed ? Number(obs.windSpeed.toFixed(1)) : null,
    };
  });

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          2-Day Temperature History
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Historical observations for the past 48 hours
        </Typography>
        
        <Box sx={{ width: '100%', height: 350, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Wind Speed (m/s)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#1976d2"
                name="Temperature (°C)"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="windSpeed"
                stroke="#dc004e"
                name="Wind Speed (m/s)"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ObservationsChart;
