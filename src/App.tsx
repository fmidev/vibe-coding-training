import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import DailyAverageTemperature from './components/DailyAverageTemperature';

function App() {

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vibe Coding Training - Sääsovellus
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <DailyAverageTemperature />
      </Container>
    </Box>
  );
}

export default App;
