import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { getWeatherSymbol } from '../utils/weatherUtils';
import type { DailyForecast } from '../services/weatherService';

interface ForecastDisplayProps {
  forecast: DailyForecast[] | null;
  loading: boolean;
  error: string | null;
}

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({
  forecast,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            7-Day Forecast
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
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
            7-Day Forecast
          </Typography>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            7-Day Forecast
          </Typography>
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No forecast data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  const getDateDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          7-Day Forecast
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
            mt: 1,
          }}
        >
          {forecast.map((day) => {
            const symbolInfo = getWeatherSymbol(day.weatherSymbol);
            const WeatherIcon = symbolInfo.icon;

            return (
              <Card variant="outlined" sx={{ height: '100%' }} key={day.date}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {getDayName(day.date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {getDateDisplay(day.date)}
                  </Typography>
                  
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    mt={2}
                    mb={2}
                  >
                    <WeatherIcon
                      sx={{ fontSize: 50, color: symbolInfo.color, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {symbolInfo.description}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary">
                        Max
                      </Typography>
                      <Typography variant="h6">
                        {day.temperature.max.toFixed(0)}°
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary">
                        Min
                      </Typography>
                      <Typography variant="h6">
                        {day.temperature.min.toFixed(0)}°
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ForecastDisplay;
