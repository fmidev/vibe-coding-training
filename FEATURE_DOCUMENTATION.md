# Päivän keskilämpötila (Daily Average Temperature)

This feature displays the daily average temperature across Finland for a selected date.

## Features

- **Date Selection**: Choose any date to view temperature data
- **Finland Temperature Map**: Visual representation showing average temperatures for 10 major Finnish cities
- **Color-coded Display**: Temperature ranges are color-coded for easy visualization
- **Optional Location Input**: Enter custom coordinates to check the temperature at any specific location
- **Real-time Data**: Uses FMI Open Data API to fetch actual weather forecast data

## How to Use

1. **Select a Date**: Use the date picker to choose the date you want to view
2. **Optional - Add Custom Location**: 
   - Enter latitude (e.g., 60.17 for Helsinki)
   - Enter longitude (e.g., 24.94 for Helsinki)
3. **Fetch Temperatures**: Click the "Hae lämpötilat" button
4. **View Results**: 
   - The map shows color-coded temperatures for major cities
   - If you entered coordinates, the specific temperature for that location appears below the map

## Temperature Color Legend

- 🔵 Blue (< -20°C): Extremely cold
- 🔷 Light Blue (-20°C to -10°C): Very cold
- 💙 Sky Blue (-10°C to 0°C): Cold
- 💚 Green (0°C to 10°C): Cool
- 💛 Yellow (10°C to 20°C): Mild
- 🟠 Orange (20°C to 30°C): Warm
- 🔴 Red (> 30°C): Hot

## Cities Included

The map displays temperatures for the following Finnish cities:
- Helsinki
- Turku
- Tampere
- Oulu
- Rovaniemi
- Jyväskylä
- Kuopio
- Lappeenranta
- Vaasa
- Joensuu

## Technical Details

- **API**: FMI Open Data OGC EDR 1.1 API
- **Collection**: pal_skandinavia (forecast data)
- **Data Range**: The API provides forecast data for upcoming days
- **Calculation**: Daily average is calculated from hourly temperature values (24 hours)

## Example Temperatures

Example average temperatures for 2025-11-24:
- Helsinki: ~3°C
- Turku: ~2°C
- Tampere: ~1.6°C
- Oulu: ~-3°C
- Rovaniemi: ~-8.5°C

Note: These are forecast values and may change as the date approaches.
