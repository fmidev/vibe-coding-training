import {
  AppBar,
  Box,
  Toolbar,
  Typography,
} from '@mui/material';
import { CloudQueue } from '@mui/icons-material';
import SailorWeatherPage from './components/SailorWeatherPage';

function App() {

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <CloudQueue sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vibe Coding Training - Sailor Weather
          </Typography>
        </Toolbar>
      </AppBar>

      <SailorWeatherPage />
    </Box>
  );
}

export default App;
