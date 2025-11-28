import type { FC } from 'react';
import { Box, Typography, Paper } from '@mui/material';
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
import type { WeatherDataPoint } from '../types/weather';

interface WeatherChartProps {
  data: WeatherDataPoint[];
}

const WeatherChart: FC<WeatherChartProps> = ({ data }) => {
  const chartData = data.map((point) => ({
    time: new Date(point.time).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
    temperature: point.temperature,
    windSpeed: point.windSpeed,
  }));

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        7-Hour Weather Forecast
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
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
              stroke="#ff7300"
              name="Temperature (°C)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="windSpeed"
              stroke="#387908"
              name="Wind Speed (m/s)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default WeatherChart;
