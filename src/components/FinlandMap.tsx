import { type FC, useMemo } from 'react';
import { Box } from '@mui/material';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  temperature?: number;
}

interface FinlandMapProps {
  locationData: LocationData[];
  getTemperatureColor: (temp?: number) => string;
}

// Geographic bounds for Finland
const GEO_BOUNDS = {
  minLat: 59,
  maxLat: 70,
  minLon: 19,
  maxLon: 32,
} as const;

// SVG dimensions
const SVG_DIMENSIONS = {
  width: 400,
  height: 600,
} as const;

// Visual constants
const MARKER_RADIUS = 20;
const TEXT_COLOR_THRESHOLD = 15;

const FinlandMap: FC<FinlandMapProps> = ({ locationData, getTemperatureColor }) => {
  // Convert geographic coordinates to SVG coordinates
  const latToY = (lat: number) => {
    return SVG_DIMENSIONS.height - 
      ((lat - GEO_BOUNDS.minLat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * SVG_DIMENSIONS.height;
  };

  const lonToX = (lon: number) => {
    return ((lon - GEO_BOUNDS.minLon) / (GEO_BOUNDS.maxLon - GEO_BOUNDS.minLon)) * SVG_DIMENSIONS.width;
  };

  // Memoize Finland outline path to avoid recalculation on every render
  const finlandOutline = useMemo(() => {
    return `
    M ${lonToX(21)} ${latToY(60)}
    L ${lonToX(22)} ${latToY(59.5)}
    L ${lonToX(23)} ${latToY(59.8)}
    L ${lonToX(24)} ${latToY(60)}
    L ${lonToX(25)} ${latToY(60.2)}
    L ${lonToX(26.5)} ${latToY(60.5)}
    L ${lonToX(28)} ${latToY(60.8)}
    L ${lonToX(29)} ${latToY(61)}
    L ${lonToX(30)} ${latToY(61.5)}
    L ${lonToX(31)} ${latToY(62)}
    L ${lonToX(30.5)} ${latToY(63)}
    L ${lonToX(29.5)} ${latToY(63.5)}
    L ${lonToX(28.5)} ${latToY(64)}
    L ${lonToX(28)} ${latToY(64.5)}
    L ${lonToX(27.5)} ${latToY(65)}
    L ${lonToX(27)} ${latToY(65.5)}
    L ${lonToX(26.5)} ${latToY(66)}
    L ${lonToX(26)} ${latToY(66.5)}
    L ${lonToX(25.5)} ${latToY(67)}
    L ${lonToX(25)} ${latToY(67.5)}
    L ${lonToX(24.5)} ${latToY(68)}
    L ${lonToX(24)} ${latToY(68.5)}
    L ${lonToX(23.5)} ${latToY(69)}
    L ${lonToX(24)} ${latToY(69.5)}
    L ${lonToX(25)} ${latToY(69.8)}
    L ${lonToX(26)} ${latToY(70)}
    L ${lonToX(27)} ${latToY(69.8)}
    L ${lonToX(27.5)} ${latToY(69.5)}
    L ${lonToX(28)} ${latToY(69)}
    L ${lonToX(28.5)} ${latToY(68.5)}
    L ${lonToX(29)} ${latToY(68)}
    L ${lonToX(29.5)} ${latToY(67.5)}
    L ${lonToX(29)} ${latToY(67)}
    L ${lonToX(28)} ${latToY(66.5)}
    L ${lonToX(27)} ${latToY(66)}
    L ${lonToX(26)} ${latToY(65.5)}
    L ${lonToX(25.5)} ${latToY(65)}
    L ${lonToX(25)} ${latToY(64.5)}
    L ${lonToX(24.5)} ${latToY(64)}
    L ${lonToX(24)} ${latToY(63.5)}
    L ${lonToX(23.5)} ${latToY(63)}
    L ${lonToX(23)} ${latToY(62.5)}
    L ${lonToX(22.5)} ${latToY(62)}
    L ${lonToX(22)} ${latToY(61.5)}
    L ${lonToX(21.5)} ${latToY(61)}
    L ${lonToX(21)} ${latToY(60.5)}
    Z
    `;
  }, []);

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2 }}>
      <svg width={SVG_DIMENSIONS.width} height={SVG_DIMENSIONS.height} viewBox={`0 0 ${SVG_DIMENSIONS.width} ${SVG_DIMENSIONS.height}`} style={{ maxWidth: '100%', height: 'auto' }}>
        {/* Finland outline */}
        <path
          d={finlandOutline}
          fill="#e0e0e0"
          stroke="#333"
          strokeWidth="2"
        />
        
        {/* City markers with temperature colors */}
        {locationData.map((location) => {
          const x = lonToX(location.lon);
          const y = latToY(location.lat);
          const color = getTemperatureColor(location.temperature);
          
          return (
            <g key={location.name}>
              {/* City marker */}
              <circle
                cx={x}
                cy={y}
                r={MARKER_RADIUS}
                fill={color}
                stroke="#333"
                strokeWidth="2"
                opacity="0.9"
              />
              
              {/* Temperature text */}
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill={location.temperature !== undefined && location.temperature > TEXT_COLOR_THRESHOLD ? 'black' : 'white'}
              >
                {location.temperature !== undefined
                  ? `${location.temperature.toFixed(0)}°`
                  : 'N/A'}
              </text>
              
              {/* City name */}
              <text
                x={x}
                y={y + 35}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#333"
              >
                {location.name}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

export default FinlandMap;
