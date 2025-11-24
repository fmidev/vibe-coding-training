# vibe-coding-training

A React application for demonstrating OGC EDR 1.1 API integration with FMI Open Data. This application is built with Vite, React, TypeScript, and Material UI.

## Features

- **React + Vite + TypeScript**: Modern React development with fast build times
- **Material UI**: Professional UI components and design system
- **OGC EDR 1.1 API Integration**: Access environmental data from FMI Open Data
- **ECMWF Collection**: Default data collection from European Centre for Medium-Range Weather Forecasts

## FMI Open Data API

This application uses the FMI Open Data OGC EDR 1.1 API:

- **Endpoint**: https://opendata.fmi.fi/edr
- **Default Collection**: ecmwf
- **Collection Metadata**: https://opendata.fmi.fi/edr/collections/ecmwf
- **API Documentation**: [OGC EDR 1.1 Specification](https://docs.ogc.org/is/19-086r6/19-086r6.html)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fmidev/vibe-coding-training.git
cd vibe-coding-training
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
vibe-coding-training/
├── src/
│   ├── services/
│   │   └── edrApi.ts       # OGC EDR 1.1 API service
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── package.json            # Project dependencies
└── vite.config.ts          # Vite configuration
```

## API Service

The `edrApi.ts` service provides functions to interact with the OGC EDR 1.1 API:

- `getCollections()` - Fetch all available collections
- `getCollection(collectionId)` - Fetch metadata for a specific collection
- `getPositionData(collectionId, coords, params)` - Query data for a specific position

## Technologies

- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Vite**: Build tool and development server
- **Material UI**: Component library
- **OGC EDR 1.1**: Environmental Data Retrieval API standard

## License

This project is for training purposes.
