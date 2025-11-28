import React from 'react';
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
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import type { StationPressureForecast } from '../services/observationsApi';

interface PressureTrendChartProps {
  forecasts: StationPressureForecast[];
  loading?: boolean;
}

// Color palette for different stations
const STATION_COLORS = [
  '#2196F3', // blue
  '#FF9800', // orange
  '#4CAF50', // green
  '#F44336', // red
  '#9C27B0', // purple
  '#00BCD4', // cyan
  '#FFEB3B', // yellow
  '#E91E63', // pink
  '#795548', // brown
  '#607D8B', // blue-grey
];

const PressureTrendChart: React.FC<PressureTrendChartProps> = ({ forecasts, loading }) => {
  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6">Loading pressure forecasts...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Check if we have any valid forecast data
  const validForecasts = forecasts.filter(f => f.forecast.length > 0 && !f.error);
  
  if (validForecasts.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sea Level Pressure Trend (6-hour Forecast)
          </Typography>
          <Alert severity="info">
            No forecast data available. Forecast data will be displayed when the API is accessible.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Combine all forecast data into a single dataset for the chart
  // Each time point will have pressure values from all stations
  const timePoints = validForecasts[0].forecast.map(f => f.time);
  
  const chartData = timePoints.map(time => {
    const dataPoint: Record<string, string | number> = {
      time: new Date(time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    
    validForecasts.forEach(stationForecast => {
      const point = stationForecast.forecast.find(f => f.time === time);
      if (point) {
        dataPoint[stationForecast.station.name] = Math.round(point.pressure * 10) / 10;
      }
    });
    
    return dataPoint;
  });

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sea Level Pressure Trend (6-hour Forecast)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Forecast data from PAL-AROME model for Gulf of Finland stations
        </Typography>
        
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time (UTC)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Pressure (hPa)', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} hPa`, '']}
                labelFormatter={(label) => `Time: ${label} UTC`}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {validForecasts.map((stationForecast, index) => (
                <Line
                  key={stationForecast.station.fmisid}
                  type="monotone"
                  dataKey={stationForecast.station.name}
                  stroke={STATION_COLORS[index % STATION_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Rising pressure typically indicates improving weather, while falling pressure may indicate deteriorating conditions.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PressureTrendChart;
