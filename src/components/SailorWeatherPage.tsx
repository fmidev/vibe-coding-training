import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import {
  getAllStationObservations,
  type StationObservations,
} from '../services/observationsApi';

const SailorWeatherPage: React.FC = () => {
  const [observations, setObservations] = useState<StationObservations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchObservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllStationObservations();
      setObservations(data);
      setLastUpdate(new Date().toLocaleString('fi-FI'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather observations');
      console.error('Error fetching observations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, []);

  const formatValue = (value: number | undefined, decimals: number = 1): string => {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatWindDirection = (degrees: number | undefined): string => {
    if (degrees === undefined || degrees === null) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return `${directions[index]} (${Math.round(degrees)}°)`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          ⛵ Sailor Weather - Gulf of Finland
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Latest weather observations from coastal weather stations in the Gulf of Finland (Suomenlahti)
        </Typography>
      </Box>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" component="h2">
                Current Observations
              </Typography>
              {lastUpdate && (
                <Typography variant="body2" color="text.secondary">
                  Last updated: {lastUpdate}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchObservations}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
          <Divider />
        </CardContent>
      </Card>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && observations.length > 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="weather observations table">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Station</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Temperature (°C)
                </TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Wind Speed (m/s)
                </TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Wind Direction
                </TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Gust Speed (m/s)
                </TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Pressure (hPa)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {observations.map((item) => (
                <TableRow
                  key={item.station.fmisid}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: item.error ? 'error.lighter' : 'inherit',
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {item.station.name}
                    </Typography>
                    {item.error && (
                      <Typography variant="caption" color="error">
                        {item.error}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {formatValue(item.observations.temperature)}
                  </TableCell>
                  <TableCell align="right">
                    {formatValue(item.observations.windSpeed)}
                  </TableCell>
                  <TableCell align="right">
                    {formatWindDirection(item.observations.windDirection)}
                  </TableCell>
                  <TableCell align="right">
                    {formatValue(item.observations.gustSpeed)}
                  </TableCell>
                  <TableCell align="right">
                    {formatValue(item.observations.pressure)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Data source: Finnish Meteorological Institute (FMI) Open Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Weather stations are located along the Gulf of Finland coastline
        </Typography>
      </Box>
    </Container>
  );
};

export default SailorWeatherPage;
