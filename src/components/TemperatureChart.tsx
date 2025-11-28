import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
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

interface TemperatureDataPoint {
  time: string;
  temperature: number;
  formattedTime: string;
}

interface TemperatureChartProps {
  data: TemperatureDataPoint[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            📊 24-Hour Temperature Forecast
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No temperature data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom color="primary">
          📊 24-Hour Temperature Forecast
        </Typography>
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedTime" 
                label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Temperature"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemperatureChart;
