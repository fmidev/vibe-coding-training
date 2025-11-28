import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import type { Location } from '../types/weather';
import { LOCATIONS } from '../types/weather';

interface LocationSelectorProps {
  selectedLocation: Location | null;
  onLocationChange: (location: Location) => void;
  onUseCurrentLocation: () => void;
  isUsingCurrentLocation: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  onUseCurrentLocation,
  isUsingCurrentLocation,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const locationName = event.target.value;
    const location = LOCATIONS.find((loc) => loc.name === locationName);
    if (location) {
      onLocationChange(location);
    }
  };

  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      <Button
        variant={isUsingCurrentLocation ? 'contained' : 'outlined'}
        startIcon={<MyLocation />}
        onClick={onUseCurrentLocation}
        sx={{ minWidth: 180 }}
      >
        Use Current Location
      </Button>
      
      <Typography variant="body1" color="text.secondary">
        or
      </Typography>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="location-select-label">Select Location</InputLabel>
        <Select
          labelId="location-select-label"
          id="location-select"
          value={!isUsingCurrentLocation && selectedLocation ? selectedLocation.name : ''}
          label="Select Location"
          onChange={handleChange}
        >
          {LOCATIONS.map((location) => (
            <MenuItem key={location.name} value={location.name}>
              {location.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LocationSelector;
