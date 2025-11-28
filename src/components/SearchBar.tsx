import { useState } from 'react';
import type { FC } from 'react';
import {
  Autocomplete,
  TextField,
  Paper,
  Box,
  Fade,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { cities, searchCities } from '../data/cities';
import type { City } from '../data/cities';

interface SearchBarProps {
  onCitySelect: (city: City) => void;
  defaultCity?: City;
}

const SearchBar: FC<SearchBarProps> = ({ onCitySelect, defaultCity }) => {
  const [value, setValue] = useState<City | null>(defaultCity || null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<City[]>(cities);

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    if (newInputValue.length > 0) {
      const filtered = searchCities(newInputValue);
      setOptions(filtered);
    } else {
      setOptions(cities);
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: City | null) => {
    setValue(newValue);
    if (newValue) {
      onCitySelect(newValue);
    }
  };

  return (
    <Fade in timeout={800}>
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          top: { xs: 100, sm: 120 },
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '90%', sm: '500px' },
          zIndex: 1000,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateX(-50%) translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Autocomplete
            value={value}
            onChange={handleChange}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            options={options}
            getOptionLabel={(option) => `${option.name}, ${option.country}`}
            isOptionEqualToValue={(option, value) =>
              option.name === value.name && option.country === value.country
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search for a city..."
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <Search sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-inputRoot': {
                fontSize: '1.1rem',
              },
            }}
          />
        </Box>
      </Paper>
    </Fade>
  );
};

export default SearchBar;
