import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import { getCollection } from './services/edrApi';
import type { Collection } from './services/edrApi';

function App() {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollectionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCollection('ecmwf');
      setCollection(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FMI Open Data - OGC EDR 1.1
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            ECMWF Collection Viewer
          </Typography>

          <Typography variant="body1" color="text.secondary">
            This application demonstrates OGC EDR 1.1 API integration with FMI Open Data.
            The default collection is ECMWF (European Centre for Medium-Range Weather Forecasts).
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}

          {collection && !loading && (
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {collection.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>ID:</strong> {collection.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Description:</strong> {collection.description}
                </Typography>
                {collection.extent?.spatial?.bbox && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Spatial Extent (bbox):</strong>{' '}
                    {JSON.stringify(collection.extent.spatial.bbox)}
                  </Typography>
                )}
                {collection.extent?.temporal?.interval && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Temporal Extent:</strong>{' '}
                    {JSON.stringify(collection.extent.temporal.interval)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          <Box>
            <Button variant="contained" onClick={fetchCollectionData} disabled={loading}>
              Refresh Collection Data
            </Button>
          </Box>

          <Card sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About OGC EDR 1.1
              </Typography>
              <Typography variant="body2" paragraph>
                The OGC Environmental Data Retrieval (EDR) API provides a standard way to query
                and retrieve environmental data. This application uses the FMI Open Data EDR
                endpoint.
              </Typography>
              <Typography variant="body2">
                <strong>API Endpoint:</strong> https://opendata.fmi.fi/edr
              </Typography>
              <Typography variant="body2">
                <strong>Documentation:</strong>{' '}
                <a
                  href="https://docs.ogc.org/is/19-086r6/19-086r6.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OGC EDR 1.1 Specification
                </a>
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
