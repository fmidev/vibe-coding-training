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
import { getAreaData } from '../services/edrApi';

interface CoverageJSONResponse {
  type: string;
  domain: {
    type: string;
    axes: {
      t: { values: string[] };
      x: { values: number[] };
      y: { values: number[] };
      composite?: {
        dataType: string;
        coordinates: string[];
        values: number[][];
      };
    };
    referencing?: unknown[];
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
      type: string;
      dataType: string;
      axisNames?: string[];
      shape?: number[];
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

// Whole Finland bounding box
const BBOX = {
  minLon: 19.5,
  maxLon: 31.5,
  minLat: 59.5,
  maxLat: 70.0,
};

// Grid resolution (number of points) - super high resolution
const GRID_RESOLUTION = 150;

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
      // Construct polygon for southern Finland area query
      const polygon = `POLYGON((${BBOX.minLon} ${BBOX.minLat},${BBOX.maxLon} ${BBOX.minLat},${BBOX.maxLon} ${BBOX.maxLat},${BBOX.minLon} ${BBOX.maxLat},${BBOX.minLon} ${BBOX.minLat}))`;
      
      const data = await getAreaData(
        'pal_skandinavia',
        polygon,
        {
          f: 'CoverageJSON',
          'parameter-name': 'Precipitation1h',
        }
      ) as CoverageJSONResponse;

      if (!data.domain?.axes?.t?.values || !data.ranges?.Precipitation1h) {
        throw new Error('Invalid data format received from API');
      }

      // Get axes information
      const timeValues = data.domain.axes.t.values;
      const xValues = data.domain.axes.x?.values || [];
      const yValues = data.domain.axes.y?.values || [];
      const precipValues = data.ranges.Precipitation1h.values;
      
      // Determine grid dimensions - use actual values or fall back to calculated grid
      const numX = xValues.length > 0 ? xValues.length : GRID_RESOLUTION;
      const numY = yValues.length > 0 ? yValues.length : GRID_RESOLUTION;
      const numT = timeValues.length;
      
      // Validate that data dimensions match expectations
      const expectedDataPoints = numX * numY * numT;
      if (precipValues.length !== expectedDataPoints) {
        console.warn(`Data dimension mismatch: expected ${expectedDataPoints}, got ${precipValues.length}`);
      }

      // Process time steps from area data
      const steps: TimeStep[] = timeValues.map((time, timeIndex) => {
        const gridData: GridPoint[] = [];
        
        // Extract data for this time step
        for (let yi = 0; yi < numY; yi++) {
          for (let xi = 0; xi < numX; xi++) {
            // Calculate index in the flat values array
            // CoverageJSON typically uses [t, y, x] ordering for area data
            const dataIndex = timeIndex * (numX * numY) + yi * numX + xi;
            
            // Safely access value with bounds checking
            const value = dataIndex < precipValues.length ? precipValues[dataIndex] : null;
            
            // Get coordinates - explicitly check for undefined to handle 0 values correctly
            const lon = xValues[xi] !== undefined ? xValues[xi] : BBOX.minLon + (xi / numX) * (BBOX.maxLon - BBOX.minLon);
            const lat = yValues[yi] !== undefined ? yValues[yi] : BBOX.minLat + (yi / numY) * (BBOX.maxLat - BBOX.minLat);
            
            gridData.push({
              lon,
              lat,
              value: value !== null && value > 0.01 ? value : null,
            });
          }
        }

        return { time, gridData };
      });

      setTimeSteps(steps);
      setCurrentTimeIndex(0);
    } catch (err) {
      console.error('Error fetching precipitation data:', err);
      // Fall back to demo data
      setError('Unable to fetch live data from API. Showing demo visualization.');
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

    // Draw water/sea background
    ctx.fillStyle = '#b8d4e8';
    ctx.fillRect(0, 0, width, height);

    // Helper function to convert lon/lat to canvas coordinates
    const toCanvasX = (lon: number) => ((lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * width;
    const toCanvasY = (lat: number) => height - ((lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * height;

    // Draw detailed Finland coastline covering the whole country
    ctx.fillStyle = '#e8e8e8';
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;

    // Detailed outline of entire Finland (from south to north, then back)
    const finlandCoastline = [
      // Southern coast - Gulf of Finland
      [21.0, 59.8], [21.5, 59.85], [22.0, 59.9], [22.5, 59.95], [23.0, 60.0],
      [23.5, 60.05], [24.0, 60.15], [24.5, 60.2], [25.0, 60.2], [25.5, 60.15],
      [26.0, 60.1], [26.5, 60.1], [27.0, 60.2], [27.5, 60.25], [28.0, 60.35],
      [28.5, 60.4], [29.0, 60.45], [29.5, 60.5], [30.0, 60.4], [30.5, 60.3],
      
      // Eastern border (with Russia)
      [30.5, 60.5], [30.5, 61.0], [30.5, 61.5], [30.5, 62.0], [30.5, 62.5],
      [30.5, 63.0], [30.5, 63.5], [30.5, 64.0], [30.5, 64.5], [30.5, 65.0],
      [30.5, 65.5], [30.5, 66.0], [30.5, 66.5], [30.5, 67.0], [30.5, 67.5],
      [30.5, 68.0], [30.0, 68.5], [29.5, 68.8], [29.0, 69.0], [28.5, 69.2],
      [28.0, 69.3], [27.5, 69.4], [27.0, 69.5], [26.5, 69.6], [26.0, 69.7],
      [25.5, 69.8], [25.0, 69.9], [24.5, 70.0], [24.0, 70.0], [23.5, 70.0],
      
      // Northern coast (Lapland)
      [23.0, 70.0], [22.5, 69.9], [22.0, 69.8], [21.5, 69.6], [21.0, 69.4],
      [20.5, 69.2], [20.0, 69.0],
      
      // Western coast (Gulf of Bothnia)
      [20.5, 68.5], [21.0, 68.0], [21.5, 67.5], [22.0, 67.0], [22.5, 66.5],
      [23.0, 66.0], [23.5, 65.5], [24.0, 65.0], [24.5, 64.5], [25.0, 64.0],
      [25.0, 63.5], [24.5, 63.0], [24.0, 62.5], [23.5, 62.0], [23.0, 61.5],
      [22.5, 61.0], [22.0, 60.7], [21.5, 60.4], [21.0, 60.2], [20.5, 60.0],
      [20.0, 60.0], [20.5, 59.9], [21.0, 59.8]
    ];

    ctx.beginPath();
    ctx.moveTo(toCanvasX(finlandCoastline[0][0]), toCanvasY(finlandCoastline[0][1]));
    finlandCoastline.forEach(([lon, lat]) => {
      ctx.lineTo(toCanvasX(lon), toCanvasY(lat));
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw major lakes
    ctx.fillStyle = '#b8d4e8';
    const lakes = [
      // Lake Saimaa area (Eastern Finland)
      [[28.0, 61.0], [28.5, 61.0], [28.5, 61.8], [28.0, 61.8]],
      [[27.5, 61.2], [28.0, 61.2], [28.0, 61.6], [27.5, 61.6]],
      // Lake Päijänne (Central Finland)
      [[25.5, 61.2], [25.8, 61.2], [25.8, 62.0], [25.5, 62.0]],
      // Lake Oulujärvi (Northern Finland)
      [[27.0, 64.2], [27.5, 64.2], [27.5, 64.5], [27.0, 64.5]],
      // Lake Inari (Lapland)
      [[27.5, 68.8], [28.5, 68.8], [28.5, 69.2], [27.5, 69.2]],
    ];

    lakes.forEach((lake) => {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(lake[0][0]), toCanvasY(lake[0][1]));
      lake.forEach(([lon, lat]) => {
        ctx.lineTo(toCanvasX(lon), toCanvasY(lat));
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Draw precipitation data
    const currentStep = timeSteps[currentTimeIndex];
    
    // Calculate grid cell dimensions dynamically
    const gridPoints = currentStep.gridData;
    const numPoints = gridPoints.length;
    const gridSize = Math.sqrt(numPoints);
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    gridPoints.forEach((point) => {
      if (point.value !== null && point.value > 0) {
        // Convert lon/lat to canvas coordinates
        const x = ((point.lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * width;
        const y = height - ((point.lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * height;
        
        ctx.fillStyle = getColorForPrecipitation(point.value);
        ctx.fillRect(x - cellWidth / 2, y - cellHeight / 2, cellWidth, cellHeight);
      }
    });

    // Draw cities across all of Finland
    const cities = [
      // Southern Finland
      { name: 'Helsinki', lon: 24.94, lat: 60.17 },
      { name: 'Espoo', lon: 24.66, lat: 60.21 },
      { name: 'Turku', lon: 22.27, lat: 60.45 },
      { name: 'Porvoo', lon: 25.67, lat: 60.39 },
      { name: 'Hämeenlinna', lon: 24.46, lat: 60.99 },
      { name: 'Lahti', lon: 25.66, lat: 60.98 },
      // Central Finland
      { name: 'Tampere', lon: 23.76, lat: 61.50 },
      { name: 'Jyväskylä', lon: 25.75, lat: 62.24 },
      { name: 'Pori', lon: 21.78, lat: 61.48 },
      { name: 'Vaasa', lon: 21.62, lat: 63.10 },
      { name: 'Kuopio', lon: 27.69, lat: 62.89 },
      { name: 'Joensuu', lon: 29.76, lat: 62.60 },
      // Northern Finland
      { name: 'Oulu', lon: 25.47, lat: 65.01 },
      { name: 'Kajaani', lon: 27.73, lat: 64.22 },
      { name: 'Rovaniemi', lon: 25.73, lat: 66.50 },
      // Lapland
      { name: 'Kemi', lon: 24.56, lat: 65.74 },
      { name: 'Sodankylä', lon: 26.60, lat: 67.42 },
      { name: 'Ivalo', lon: 27.55, lat: 68.66 },
    ];

    ctx.font = 'bold 16px Arial';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    cities.forEach(city => {
      if (city.lon >= BBOX.minLon && city.lon <= BBOX.maxLon &&
          city.lat >= BBOX.minLat && city.lat <= BBOX.maxLat) {
        const x = ((city.lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * width;
        const y = height - ((city.lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * height;
        
        // Draw city dot
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw city name with outline
        ctx.strokeText(city.name, x + 8, y + 5);
        ctx.fillText(city.name, x + 8, y + 5);
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
      animationRef.current = window.setInterval(() => {
        setCurrentTimeIndex((prev) => {
          if (prev >= timeSteps.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500);

      return () => {
        if (animationRef.current !== null) {
          clearInterval(animationRef.current);
        }
      };
    } else if (animationRef.current !== null) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, [isPlaying, timeSteps.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (_event: Event | React.SyntheticEvent, value: number | number[]) => {
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
          🌧️ Sadetutka ja salamahavainnot - Finland
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
                width={1600}
                height={2000}
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
                  Live data from FMI Open Data EDR API will be displayed when network is available
                </>
              ) : (
                <>
                  Data source: Live data from FMI Open Data EDR API (pal_skandinavia collection)
                  <br />
                  Precipitation intensity (mm/h) with proper Finland map background
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
