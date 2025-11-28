import { type FC, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { getTodayDate, getAverageTemperature } from '../services/temperatureApi';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  temperature?: number;
}

const FINLAND_LOCATIONS: LocationData[] = [
  { name: 'Helsinki', lat: 60.17, lon: 24.94 },
  { name: 'Turku', lat: 60.45, lon: 22.27 },
  { name: 'Tampere', lat: 61.50, lon: 23.79 },
  { name: 'Oulu', lat: 65.01, lon: 25.47 },
  { name: 'Rovaniemi', lat: 66.50, lon: 25.73 },
  { name: 'Jyväskylä', lat: 62.24, lon: 25.75 },
  { name: 'Kuopio', lat: 62.89, lon: 27.68 },
  { name: 'Lappeenranta', lat: 61.06, lon: 28.19 },
  { name: 'Vaasa', lat: 63.10, lon: 21.62 },
  { name: 'Joensuu', lat: 62.60, lon: 29.76 },
];

const DailyAverageTemperature: FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [customLat, setCustomLat] = useState<string>('');
  const [customLon, setCustomLon] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [customLocationTemp, setCustomLocationTemp] = useState<number | null>(null);

  const handleFetchTemperatures = async () => {
    setLoading(true);
    setError(null);
    setCustomLocationTemp(null);

    try {
      // Fetch temperatures for predefined Finland locations
      const results = await Promise.all(
        FINLAND_LOCATIONS.map(async (location) => {
          try {
            const temp = await getAverageTemperature(
              location.lat,
              location.lon,
              selectedDate
            );
            return { ...location, temperature: temp };
          } catch (err) {
            console.error(`Failed to fetch temperature for ${location.name}:`, err);
            return location;
          }
        })
      );

      setLocationData(results);

      // Fetch temperature for custom location if provided
      if (customLat && customLon) {
        const lat = parseFloat(customLat);
        const lon = parseFloat(customLon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const temp = await getAverageTemperature(lat, lon, selectedDate);
          setCustomLocationTemp(temp);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch temperature data');
      console.error('Error fetching temperatures:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureColor = (temp?: number): string => {
    if (temp === undefined) return '#cccccc';
    if (temp < -20) return '#0000ff';
    if (temp < -10) return '#4169e1';
    if (temp < 0) return '#87ceeb';
    if (temp < 10) return '#90ee90';
    if (temp < 20) return '#ffff00';
    if (temp < 30) return '#ffa500';
    return '#ff0000';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Päivän keskilämpötila Suomessa
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Näytä päivän keskilämpötila Suomen eri kaupungeissa valitulle päivälle
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Päivämäärä"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Valinnainen: Tarkista tietty sijainti
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Leveyspiiri (esim. 60.17)"
                  type="number"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  fullWidth
                  inputProps={{ step: '0.01' }}
                />
                <TextField
                  label="Pituuspiiri (esim. 24.94)"
                  type="number"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  fullWidth
                  inputProps={{ step: '0.01' }}
                />
              </Stack>
            </Box>

            <Button
              variant="contained"
              onClick={handleFetchTemperatures}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Hae lämpötilat'}
            </Button>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {locationData.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Lämpötilakartta - {selectedDate}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 2,
                mt: 1,
              }}
            >
              {locationData.map((location) => (
                <Paper
                  key={location.name}
                  elevation={3}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: getTemperatureColor(location.temperature),
                    color: location.temperature !== undefined && location.temperature > 15 ? 'black' : 'white',
                    minHeight: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {location.name}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {location.temperature !== undefined
                        ? `${location.temperature.toFixed(1)}°C`
                        : 'N/A'}
                    </Typography>
                  </Paper>
                ))}
              </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Väriselite:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#0000ff' }} />
                  <Typography variant="caption">&lt; -20°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#4169e1' }} />
                  <Typography variant="caption">-20°C - -10°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#87ceeb' }} />
                  <Typography variant="caption">-10°C - 0°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#90ee90' }} />
                  <Typography variant="caption">0°C - 10°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#ffff00' }} />
                  <Typography variant="caption">10°C - 20°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#ffa500' }} />
                  <Typography variant="caption">20°C - 30°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#ff0000' }} />
                  <Typography variant="caption">&gt; 30°C</Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}

      {customLocationTemp !== null && customLat && customLon && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Valittu sijainti
            </Typography>
            <Typography variant="body1">
              Koordinaatit: {customLat}, {customLon}
            </Typography>
            <Typography variant="h4" sx={{ mt: 2 }}>
              Keskilämpötila: {customLocationTemp.toFixed(1)}°C
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DailyAverageTemperature;
