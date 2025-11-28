import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography, CircularProgress, Alert } from '@mui/material';
import { ThermostatAuto, AcUnit } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import { getAreaData } from '../services/edrApi';
import type { CoverageJSONData, WeatherDataPoint } from '../types/weather';
import { getTemperatureColor, getSnowfallColor } from '../utils/colorUtils';

interface WeatherMapProps {
  width?: string;
  height?: string;
}

// Component to handle map bounds
const MapBounds: React.FC<{ bounds: [[number, number], [number, number]] }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds);
  }, [map, bounds]);
  return null;
};

const WeatherMap: React.FC<WeatherMapProps> = ({ width = '100%', height = '600px' }) => {
  const [dataType, setDataType] = useState<'temperature' | 'snowfall'>('temperature');
  const [weatherData, setWeatherData] = useState<WeatherDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scandinavia bounds
  const scandinaviaBounds: [[number, number], [number, number]] = [
    [55, 5], // Southwest corner (lat, lon)
    [71, 31], // Northeast corner
  ];

  const fetchWeatherData = async (type: 'temperature' | 'snowfall') => {
    setLoading(true);
    setError(null);
    
    try {
      // Define a polygon covering Scandinavia
      const polygon = 'POLYGON((5 55, 31 55, 31 71, 5 71, 5 55))';
      
      // Get current datetime
      const now = new Date();
      const datetime = now.toISOString().split('.')[0] + 'Z';
      
      // Choose parameter based on data type
      const parameter = type === 'temperature' ? 'Temperature' : 'Precipitation1h';
      
      console.log('Fetching weather data:', { type, parameter, polygon, datetime });
      
      const data = await getAreaData(
        'pal_skandinavia',
        polygon,
        {
          f: 'CoverageJSON',
          'parameter-name': parameter,
          datetime: datetime,
        }
      ) as CoverageJSONData;
      
      console.log('Received weather data:', data);
      
      // Parse the CoverageJSON data
      if (data && data.domain && data.ranges) {
        const points: WeatherDataPoint[] = [];
        const xValues = data.domain.axes.x?.values || [];
        const yValues = data.domain.axes.y?.values || [];
        const paramKey = Object.keys(data.ranges)[0];
        
        if (!paramKey) {
          throw new Error('No data available for the selected parameter');
        }
        
        const values = data.ranges[paramKey].values;
        const shape = data.ranges[paramKey].shape || [];
        
        console.log('Data shape:', shape, 'Values length:', values.length);
        console.log('X values:', xValues.length, 'Y values:', yValues.length);
        
        // Parse grid data
        let valueIndex = 0;
        for (let yIdx = 0; yIdx < yValues.length; yIdx++) {
          for (let xIdx = 0; xIdx < xValues.length; xIdx++) {
            const value = values[valueIndex];
            if (value !== null && value !== undefined && !isNaN(value)) {
              const lat = yValues[yIdx];
              const lon = xValues[xIdx];
              const color = type === 'temperature' 
                ? getTemperatureColor(value)
                : getSnowfallColor(value);
              
              points.push({ lat, lon, value, color });
            }
            valueIndex++;
          }
        }
        
        console.log('Parsed weather points:', points.length);
        setWeatherData(points);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(dataType);
  }, [dataType]);

  const handleDataTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'temperature' | 'snowfall' | null) => {
    if (newType) {
      setDataType(newType);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h2" color="primary">
          Interactive Weather Map - Scandinavia
        </Typography>
        
        <ToggleButtonGroup
          value={dataType}
          exclusive
          onChange={handleDataTypeChange}
          aria-label="weather data type"
          size="small"
        >
          <ToggleButton value="temperature" aria-label="temperature">
            <ThermostatAuto sx={{ mr: 1 }} />
            Temperature
          </ToggleButton>
          <ToggleButton value="snowfall" aria-label="snowfall">
            <AcUnit sx={{ mr: 1 }} />
            Snowfall
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box sx={{ width, height, position: 'relative' }}>
          <MapContainer
            bounds={scandinaviaBounds}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <MapBounds bounds={scandinaviaBounds} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {weatherData.map((point, idx) => (
              <Circle
                key={`${point.lat}-${point.lon}-${idx}`}
                center={[point.lat, point.lon]}
                radius={15000}
                pathOptions={{
                  fillColor: point.color,
                  fillOpacity: 0.6,
                  color: point.color,
                  weight: 1,
                  opacity: 0.8,
                }}
              />
            ))}
          </MapContainer>
          
          {weatherData.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'white',
                p: 1,
                borderRadius: 1,
                boxShadow: 2,
                zIndex: 1000,
              }}
            >
              <Typography variant="caption" display="block">
                <strong>Data points:</strong> {weatherData.length}
              </Typography>
              <Typography variant="caption" display="block">
                <strong>{dataType === 'temperature' ? 'Temperature Range' : 'Snowfall Range'}:</strong>{' '}
                {Math.min(...weatherData.map(p => p.value)).toFixed(1)} - {Math.max(...weatherData.map(p => p.value)).toFixed(1)}{' '}
                {dataType === 'temperature' ? '°C' : 'mm'}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Forecasted weather data from FMI Open Data (pal_skandinavia collection).
        {dataType === 'temperature' && ' Colors: Blue = Cold, Red = Hot'}
        {dataType === 'snowfall' && ' Colors: Light blue = Light snowfall, Dark blue = Heavy snowfall'}
      </Typography>
    </Paper>
  );
};

export default WeatherMap;
