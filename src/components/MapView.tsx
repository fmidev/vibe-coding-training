import type { FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Create a custom temperature icon
const createTemperatureIcon = (temperature: number, unit: string) => {
  return L.divIcon({
    className: 'custom-temperature-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
        text-align: center;
        border: 2px solid white;
      ">
        ${temperature.toFixed(1)}${unit}
      </div>
    `,
    iconSize: [70, 36],
    iconAnchor: [35, 18],
  });
};

interface MapViewProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  temperature?: number;
  temperatureUnit?: string;
}

const MapView: FC<MapViewProps> = ({
  latitude,
  longitude,
  locationName = 'Location',
  temperature,
  temperatureUnit = '°C',
}) => {
  // Use custom temperature icon if temperature is available
  const markerIcon = temperature !== undefined && temperature !== null 
    ? createTemperatureIcon(temperature, temperatureUnit)
    : undefined;

  return (
    <Box sx={{ height: '400px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[latitude, longitude]}
          icon={markerIcon}
        >
          <Tooltip permanent direction="top" offset={[0, -20]}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                {locationName}
              </Typography>
            </Box>
          </Tooltip>
          <Popup>
            <Box sx={{ p: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {locationName}
              </Typography>
              {temperature !== undefined && temperature !== null && (
                <Typography variant="body1" component="div">
                  <strong>Temperature:</strong> {temperature.toFixed(1)}{temperatureUnit}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.abs(latitude).toFixed(3)}°{latitude >= 0 ? 'N' : 'S'}, {Math.abs(longitude).toFixed(3)}°{longitude >= 0 ? 'E' : 'W'}
              </Typography>
            </Box>
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default MapView;
