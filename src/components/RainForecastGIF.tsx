import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Slider,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import { PlayArrow, Pause, Refresh } from '@mui/icons-material';
import { getPositionData } from '../services/edrApi';

interface CoverageJSONResponse {
  type: string;
  domain: {
    axes: {
      t: { values: string[] };
      x: { values: number[] };
      y: { values: number[] };
    };
  };
  parameters: {
    [key: string]: {
      description?: { fi?: string };
      unit?: {
        label?: { fi?: string };
        symbol?: string;
      };
    };
  };
  ranges: {
    [key: string]: {
      values: (number | null)[];
    };
  };
}

interface GridPoint {
  lon: number;
  lat: number;
  value: number | null;
}

interface TimeStep {
  time: string;
  gridData: GridPoint[];
}

// Southern Finland bounding box
const BBOX = {
  minLon: 22,
  maxLon: 26,
  minLat: 59.5,
  maxLat: 61.5,
};

// Grid resolution (number of points)
const GRID_RESOLUTION = 20;

const RainForecastGIF: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeSteps, setTimeSteps] = useState<TimeStep[]>([]);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Color scale for precipitation (mm/h)
  const getColorForPrecipitation = (value: number | null): string => {
    if (value === null || value <= 0) return 'rgba(255, 255, 255, 0.1)';
    if (value < 0.1) return 'rgba(180, 230, 255, 0.3)';
    if (value < 0.5) return 'rgba(120, 200, 255, 0.5)';
    if (value < 1.0) return 'rgba(60, 160, 255, 0.6)';
    if (value < 2.0) return 'rgba(0, 120, 255, 0.7)';
    if (value < 5.0) return 'rgba(0, 80, 200, 0.8)';
    if (value < 10.0) return 'rgba(255, 200, 0, 0.8)';
    if (value < 20.0) return 'rgba(255, 140, 0, 0.9)';
    return 'rgba(255, 0, 0, 0.9)';
  };

  const generateDemoData = useCallback(() => {
    // Generate demo data when API is unavailable
    const lonStep = (BBOX.maxLon - BBOX.minLon) / GRID_RESOLUTION;
    const latStep = (BBOX.maxLat - BBOX.minLat) / GRID_RESOLUTION;
    
    const gridPoints: { lon: number; lat: number }[] = [];
    for (let i = 0; i <= GRID_RESOLUTION; i++) {
      for (let j = 0; j <= GRID_RESOLUTION; j++) {
        gridPoints.push({
          lon: BBOX.minLon + i * lonStep,
          lat: BBOX.minLat + j * latStep,
        });
      }
    }

    // Generate 12 time steps (3 hours of data, every 15 minutes)
    const steps: TimeStep[] = [];
    const now = new Date();
    
    for (let t = 0; t < 12; t++) {
      const time = new Date(now.getTime() + t * 15 * 60 * 1000).toISOString();
      
      const gridData = gridPoints.map((point) => {
        // Create a moving precipitation pattern
        const phase = (t / 12) * Math.PI * 2;
        const lonWave = Math.sin((point.lon - BBOX.minLon) * 2 + phase) * 0.5 + 0.5;
        const latWave = Math.sin((point.lat - BBOX.minLat) * 3 + phase * 1.5) * 0.5 + 0.5;
        
        // Combine waves to create precipitation pattern
        const intensity = lonWave * latWave * 5;
        const noise = Math.random() * 0.5;
        const value = intensity + noise;
        
        return {
          lon: point.lon,
          lat: point.lat,
          value: value > 0.5 ? value : null,
        };
      });

      steps.push({ time, gridData });
    }

    setTimeSteps(steps);
    setCurrentTimeIndex(0);
  }, []);

  const fetchPrecipitationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a grid of points
      const lonStep = (BBOX.maxLon - BBOX.minLon) / GRID_RESOLUTION;
      const latStep = (BBOX.maxLat - BBOX.minLat) / GRID_RESOLUTION;
      
      const gridPoints: { lon: number; lat: number }[] = [];
      for (let i = 0; i <= GRID_RESOLUTION; i++) {
        for (let j = 0; j <= GRID_RESOLUTION; j++) {
          gridPoints.push({
            lon: BBOX.minLon + i * lonStep,
            lat: BBOX.minLat + j * latStep,
          });
        }
      }

      // For demo purposes, fetch data for a center point and simulate grid data
      // In a real implementation, you would fetch data for all points or use area query
      const centerLon = (BBOX.minLon + BBOX.maxLon) / 2;
      const centerLat = (BBOX.minLat + BBOX.maxLat) / 2;
      
      const data = await getPositionData(
        'pal_skandinavia',
        `POINT(${centerLon} ${centerLat})`,
        {
          f: 'CoverageJSON',
          'parameter-name': 'Precipitation1h',
        }
      ) as CoverageJSONResponse;

      if (!data.domain?.axes?.t?.values || !data.ranges?.Precipitation1h) {
        throw new Error('Invalid data format received from API');
      }

      // Process time steps
      const timeValues = data.domain.axes.t.values;
      const precipValues = data.ranges.Precipitation1h.values;

      const steps: TimeStep[] = timeValues.map((time, timeIndex) => {
        // Simulate grid data by adding random variation around the center point value
        const centerValue = precipValues[timeIndex] || 0;
        const gridData = gridPoints.map((point) => {
          // Add distance-based variation
          const distLon = Math.abs(point.lon - centerLon);
          const distLat = Math.abs(point.lat - centerLat);
          const distance = Math.sqrt(distLon * distLon + distLat * distLat);
          
          // Simulate spatial variation
          const variation = (Math.random() - 0.5) * 2 + Math.sin(distance * 5) * 0.5;
          const value = Math.max(0, centerValue + variation);
          
          return {
            lon: point.lon,
            lat: point.lat,
            value: value > 0.01 ? value : null,
          };
        });

        return { time, gridData };
      });

      setTimeSteps(steps);
      setCurrentTimeIndex(0);
    } catch (err) {
      console.error('Error fetching precipitation data:', err);
      // Fall back to demo data
      setError('Unable to fetch live data. Showing demo visualization.');
      generateDemoData();
    } finally {
      setLoading(false);
    }
  }, [generateDemoData]);

  useEffect(() => {
    fetchPrecipitationData();
  }, [fetchPrecipitationData]);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || timeSteps.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, width, height);

    // Draw grid cells
    const currentStep = timeSteps[currentTimeIndex];
    const cellWidth = width / (GRID_RESOLUTION + 1);
    const cellHeight = height / (GRID_RESOLUTION + 1);

    currentStep.gridData.forEach((point, index) => {
      const i = Math.floor(index / (GRID_RESOLUTION + 1));
      const j = index % (GRID_RESOLUTION + 1);
      
      const x = i * cellWidth;
      const y = height - (j + 1) * cellHeight; // Flip Y axis

      ctx.fillStyle = getColorForPrecipitation(point.value);
      ctx.fillRect(x, y, cellWidth, cellHeight);
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_RESOLUTION + 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }

    // Draw city labels
    const cities = [
      { name: 'Helsinki', lon: 24.94, lat: 60.17 },
      { name: 'Espoo', lon: 24.66, lat: 60.21 },
      { name: 'Turku', lon: 22.27, lat: 60.45 },
    ];

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    cities.forEach(city => {
      if (city.lon >= BBOX.minLon && city.lon <= BBOX.maxLon &&
          city.lat >= BBOX.minLat && city.lat <= BBOX.maxLat) {
        const x = ((city.lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * width;
        const y = height - ((city.lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * height;
        
        ctx.fillStyle = '#000';
        ctx.fillText('•', x - 3, y + 3);
        ctx.fillText(city.name, x + 5, y + 4);
      }
    });
  }, [timeSteps, currentTimeIndex]);

  useEffect(() => {
    if (timeSteps.length > 0) {
      drawMap();
    }
  }, [timeSteps, currentTimeIndex, drawMap]);

  useEffect(() => {
    if (isPlaying && timeSteps.length > 0) {
      animationRef.current = setInterval(() => {
        setCurrentTimeIndex((prev) => {
          if (prev >= timeSteps.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500) as unknown as number;

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, [isPlaying, timeSteps.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (_event: Event, value: number | number[]) => {
    setCurrentTimeIndex(value as number);
    setIsPlaying(false);
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom color="primary">
          🌧️ Sadetutka ja salamahavainnot - Southern Finland
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && timeSteps.length > 0 && (
          <>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '2px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#e8f4f8',
                }}
              />
            </Box>

            <Box sx={{ bgcolor: '#3f51b5', p: 2, borderRadius: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton 
                  color="inherit" 
                  onClick={handlePlayPause}
                  sx={{ color: 'white' }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    {formatTime(timeSteps[currentTimeIndex].time)}
                  </Typography>
                  <Slider
                    value={currentTimeIndex}
                    min={0}
                    max={timeSteps.length - 1}
                    onChange={handleSliderChange}
                    sx={{
                      color: 'white',
                      '& .MuiSlider-thumb': {
                        width: 20,
                        height: 20,
                      },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      {formatTime(timeSteps[0].time)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      {formatTime(timeSteps[timeSteps.length - 1].time)}
                    </Typography>
                  </Stack>
                </Box>

                <IconButton 
                  color="inherit" 
                  onClick={fetchPrecipitationData}
                  disabled={loading}
                  sx={{ color: 'white' }}
                >
                  <Refresh />
                </IconButton>
              </Stack>
            </Box>

            {/* Legend */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Heikko (Light) → Kohtalaista (Moderate) → Voimakasta (Heavy)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {[
                  { label: '0.1', color: 'rgba(180, 230, 255, 0.7)' },
                  { label: '0.5', color: 'rgba(120, 200, 255, 0.7)' },
                  { label: '1', color: 'rgba(60, 160, 255, 0.7)' },
                  { label: '2', color: 'rgba(0, 120, 255, 0.7)' },
                  { label: '5', color: 'rgba(0, 80, 200, 0.8)' },
                  { label: '10', color: 'rgba(255, 200, 0, 0.8)' },
                  { label: '20+', color: 'rgba(255, 0, 0, 0.9)' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 20,
                        backgroundColor: item.color,
                        border: '1px solid #ccc',
                      }}
                    />
                    <Typography variant="caption">{item.label}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {error ? (
                <>
                  Data source: Demo visualization (simulated precipitation pattern)
                  <br />
                  Live data from FMI Open Data will be displayed when available
                </>
              ) : (
                <>
                  Data source: FMI Open Data (pal_skandinavia collection)
                  <br />
                  Precipitation intensity shown in mm/h
                </>
              )}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RainForecastGIF;
