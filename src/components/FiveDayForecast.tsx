import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  CloudQueue,
  Grain,
  AcUnit,
  Thunderstorm,
  Foggy,
} from '@mui/icons-material';
import { getPositionData } from '../services/edrApi';
import type { CoverageJSONResponse } from '../types/weather';

// Refresh interval in milliseconds (1 hour)
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

interface DayForecast {
  date: Date;
  minTemp: number;
  maxTemp: number;
  avgWindSpeed: number;
  weatherSymbol: number;
}

const FiveDayForecast = () => {
  const [forecastData, setForecastData] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map weather symbols to icons
  const getWeatherIcon = (symbol: number) => {
    // FMI Weather Symbol codes (simplified mapping)
    if (symbol === 1) return <WbSunny sx={{ fontSize: 48 }} />;
    if (symbol >= 2 && symbol <= 3) return <CloudQueue sx={{ fontSize: 48 }} />;
    if (symbol >= 4 && symbol <= 6) return <Cloud sx={{ fontSize: 48 }} />;
    if (symbol >= 21 && symbol <= 27) return <Thunderstorm sx={{ fontSize: 48 }} />;
    if (symbol >= 31 && symbol <= 34) return <Foggy sx={{ fontSize: 48 }} />;
    if (symbol >= 41 && symbol <= 49) return <Grain sx={{ fontSize: 48 }} />;
    if (symbol >= 51 && symbol <= 77) return <AcUnit sx={{ fontSize: 48 }} />;
    return <CloudQueue sx={{ fontSize: 48 }} />;
  };

  const getWeatherDescription = (symbol: number): string => {
    if (symbol === 1) return 'Clear';
    if (symbol >= 2 && symbol <= 3) return 'Partly cloudy';
    if (symbol >= 4 && symbol <= 6) return 'Cloudy';
    if (symbol >= 21 && symbol <= 27) return 'Thunderstorms';
    if (symbol >= 31 && symbol <= 34) return 'Foggy';
    if (symbol >= 41 && symbol <= 49) return 'Rain';
    if (symbol >= 51 && symbol <= 77) return 'Snow';
    return 'Cloudy';
  };

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      // Helsinki coordinates: 24.94°E, 60.17°N
      const now = new Date();
      const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const datetimeRange = `${now.toISOString()}/${fiveDaysLater.toISOString()}`;

      const data = await getPositionData(
        'pal_skandinavia',
        'POINT(24.94 60.17)',
        {
          f: 'CoverageJSON',
          'parameter-name': 'Temperature,WindSpeedMS,WeatherSymbol3',
          datetime: datetimeRange,
        }
      ) as CoverageJSONResponse;

      // Validate response has required data
      if (!data || !data.ranges || !data.domain?.axes?.t) {
        throw new Error('Invalid response from weather API');
      }

      // Extract forecast data
      const times = data.domain.axes.t.values;
      const temperatures = data.ranges.temperature?.values || data.ranges.Temperature?.values || [];
      const windSpeeds = data.ranges.windspeedms?.values || data.ranges.WindSpeedMS?.values || [];
      const weatherSymbols = data.ranges.weathersymbol3?.values || data.ranges.WeatherSymbol3?.values || [];

      // Group by day
      const dayMap = new Map<string, { temps: number[]; winds: number[]; symbols: number[] }>();
      
      times.forEach((time, index) => {
        const date = new Date(time);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dayMap.has(dateKey)) {
          dayMap.set(dateKey, { temps: [], winds: [], symbols: [] });
        }
        
        const day = dayMap.get(dateKey)!;
        if (temperatures[index] !== null && temperatures[index] !== undefined) {
          day.temps.push(temperatures[index]);
        }
        if (windSpeeds[index] !== null && windSpeeds[index] !== undefined) {
          day.winds.push(windSpeeds[index]);
        }
        if (weatherSymbols[index] !== null && weatherSymbols[index] !== undefined) {
          day.symbols.push(weatherSymbols[index]);
        }
      });

      // Calculate daily aggregates
      const dailyForecasts: DayForecast[] = [];
      Array.from(dayMap.entries()).slice(0, 5).forEach(([dateKey, values]) => {
        if (values.temps.length > 0) {
          // Use the most common weather symbol (mode)
          const symbolCounts = new Map<number, number>();
          values.symbols.forEach(s => {
            symbolCounts.set(s, (symbolCounts.get(s) || 0) + 1);
          });
          const mostCommonSymbol = Array.from(symbolCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 1;

          dailyForecasts.push({
            date: new Date(dateKey),
            minTemp: Math.min(...values.temps),
            maxTemp: Math.max(...values.temps),
            avgWindSpeed: values.winds.reduce((a, b) => a + b, 0) / values.winds.length,
            weatherSymbol: mostCommonSymbol,
          });
        }
      });

      setForecastData(dailyForecasts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast data');
      console.error('Error fetching forecast data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    // Refresh every hour
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-FI', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            🌤️ 5-Day Weather Forecast for Helsinki
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-around' }}
          >
            {forecastData.map((day, index) => (
              <Paper
                key={day.date.toISOString()}
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  flex: 1,
                  bgcolor: index === 0 ? 'action.selected' : 'background.paper',
                  minWidth: { xs: '100%', sm: '150px' },
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {formatDate(day.date)}
                </Typography>
                
                <Box sx={{ my: 2, color: 'primary.main' }}>
                  {getWeatherIcon(day.weatherSymbol)}
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {getWeatherDescription(day.weatherSymbol)}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ my: 1 }}>
                  <Typography variant="h6" color="error.main">
                    {day.maxTemp.toFixed(1)}°C
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High
                  </Typography>
                </Box>
                
                <Box sx={{ my: 1 }}>
                  <Typography variant="h6" color="info.main">
                    {day.minTemp.toFixed(1)}°C
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ my: 1 }}>
                  <Typography variant="body1">
                    💨 {day.avgWindSpeed.toFixed(1)} m/s
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Wind
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Data source: FMI Open Data (PAL Skandinavia collection)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FiveDayForecast;
