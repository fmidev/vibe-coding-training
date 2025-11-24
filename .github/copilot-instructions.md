# GitHub Copilot Instructions for vibe-coding-training

## Project Overview
This is a React + Vite + TypeScript application that integrates with FMI Open Data using the OGC EDR 1.1 API standard. The application is designed for training purposes to demonstrate modern web development practices.

## Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Material UI (MUI)
- **API Integration**: OGC EDR 1.1 (Environmental Data Retrieval)
- **Data Source**: FMI Open Data (https://opendata.fmi.fi/edr)

## Code Style and Conventions

### TypeScript
- Use TypeScript for all new files
- Define interfaces for API responses and data structures
- Use strict type checking
- Avoid `any` type; use `unknown` when necessary

### React
- Use functional components with hooks
- Prefer `const` for component definitions
- Use proper TypeScript types for props and state
- Follow React best practices for hooks usage (useEffect, useState, etc.)

### Material UI
- Use MUI components for all UI elements
- Follow Material Design principles
- Use the theme system for consistent styling
- Import components from `@mui/material`

### API Integration
- All API calls should go through the `src/services/edrApi.ts` service
- Handle errors gracefully with try-catch blocks
- Show loading states during API calls
- Display user-friendly error messages

### File Organization
```
src/
├── services/       # API service files
├── components/     # Reusable React components
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── App.tsx         # Main application component
```

## API Guidelines

### OGC EDR 1.1 API
- Base URL: `https://opendata.fmi.fi/edr`
- Default Collection: `ecmwf`
- Documentation: https://docs.ogc.org/is/19-086r6/19-086r6.html

### Common Query Patterns
1. **Get Collections**: `/collections`
2. **Get Collection Metadata**: `/collections/{collectionId}`
3. **Position Query**: `/collections/{collectionId}/position?coords=POINT(lon lat)`

### Response Handling
- Always check response status before parsing JSON
- Implement proper error handling for network failures
- Type API responses with TypeScript interfaces

## Development Workflow

### Before Making Changes
1. Run `npm install` to ensure dependencies are up to date
2. Run `npm run dev` to start the development server
3. Run `npm run lint` to check code quality

### Code Quality
- Follow ESLint rules configured in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Test API integration with real endpoints
- Verify UI components render correctly
- Check responsive design on different screen sizes

## Common Tasks

### Adding a New Component
```typescript
import { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
}

const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return (
    <Box>
      <Typography variant="h5">{title}</Typography>
    </Box>
  );
};

export default MyComponent;
```

### Adding a New API Function
```typescript
export const getNewData = async (params: string): Promise<DataType> => {
  const response = await fetch(`${EDR_BASE_URL}/endpoint/${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
};
```

## Security Considerations
- Never commit API keys or secrets
- Validate and sanitize user inputs
- Use HTTPS for all API calls
- Handle CORS appropriately

## Performance Tips
- Use React.memo for expensive components
- Implement proper loading states
- Avoid unnecessary re-renders
- Use efficient data structures

## Documentation
- Update README.md when adding new features
- Document API functions with JSDoc comments
- Keep code examples up to date

## Helpful Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

## Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Material UI Documentation](https://mui.com)
- [OGC EDR 1.1 Specification](https://docs.ogc.org/is/19-086r6/19-086r6.html)
- [FMI Open Data](https://www.ilmatieteenlaitos.fi/avoin-data)
