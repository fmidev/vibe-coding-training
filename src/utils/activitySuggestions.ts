/**
 * Activity suggestions based on weather conditions
 * Weather symbol codes based on FMI weather symbols
 */

export interface WeatherConditions {
  weatherSymbol: number;
  temperature: number;
  precipitation?: number;
}

export interface ActivitySuggestion {
  emoji: string;
  activity: string;
  description: string;
}

/**
 * FMI Weather Symbol Codes:
 * 1 = Clear/Sunny
 * 2 = Partly cloudy
 * 3 = Cloudy
 * 21 = Light showers
 * 22 = Showers
 * 23 = Heavy showers
 * 31 = Light rain
 * 32 = Rain
 * 33 = Heavy rain
 * 41 = Light snow showers
 * 42 = Snow showers
 * 43 = Heavy snow showers
 * 51 = Light snow
 * 52 = Snow
 * 53 = Heavy snow
 * 61 = Thunderstorm
 * 62 = Heavy thunderstorm
 * 63 = Thunderstorm
 * 64 = Heavy thunderstorm
 * 71 = Light sleet showers
 * 72 = Sleet showers
 * 73 = Heavy sleet showers
 * 81 = Light sleet
 * 82 = Sleet
 * 83 = Heavy sleet
 * 91 = Fog
 * 92 = Fog
 */

/**
 * Get activity suggestion based on weather conditions
 */
export const getActivitySuggestion = (
  conditions: WeatherConditions
): ActivitySuggestion => {
  const { weatherSymbol, temperature } = conditions;

  // Thunderstorm - stay indoors
  if (weatherSymbol >= 61 && weatherSymbol <= 64) {
    return {
      emoji: '🏠',
      activity: 'Stay Indoors',
      description: 'Read a book, watch movies, or play board games',
    };
  }

  // Snow conditions - winter activities
  if (
    (weatherSymbol >= 41 && weatherSymbol <= 43) ||
    (weatherSymbol >= 51 && weatherSymbol <= 53)
  ) {
    if (temperature < 0) {
      return {
        emoji: '⛷️',
        activity: 'Skiing',
        description: 'Perfect conditions for skiing or snowboarding',
      };
    } else if (temperature >= 0 && temperature <= 2) {
      return {
        emoji: '☃️',
        activity: 'Snowman',
        description: 'Great weather for building a snowman',
      };
    } else {
      // Snow when temperature is above 2°C - likely wet and slushy
      return {
        emoji: '🏠',
        activity: 'Stay Cozy',
        description: 'Slushy conditions - best to stay warm indoors',
      };
    }
  }

  // Rain conditions
  if (
    (weatherSymbol >= 21 && weatherSymbol <= 23) ||
    (weatherSymbol >= 31 && weatherSymbol <= 33)
  ) {
    if (temperature >= 15) {
      return {
        emoji: '🏊',
        activity: 'Swimming',
        description: 'Warm rain - good for swimming or water activities',
      };
    } else if (temperature > 5) {
      return {
        emoji: '☂️',
        activity: 'Indoor Activities',
        description: 'Take an umbrella or enjoy indoor activities',
      };
    } else {
      return {
        emoji: '🏠',
        activity: 'Stay Cozy',
        description: 'Cold and rainy - stay warm indoors',
      };
    }
  }

  // Sleet conditions
  if (
    (weatherSymbol >= 71 && weatherSymbol <= 73) ||
    (weatherSymbol >= 81 && weatherSymbol <= 83)
  ) {
    return {
      emoji: '🏠',
      activity: 'Stay Indoors',
      description: 'Unpleasant weather - best to stay inside',
    };
  }

  // Fog
  if (weatherSymbol >= 91 && weatherSymbol <= 92) {
    return {
      emoji: '☕',
      activity: 'Café Visit',
      description: 'Enjoy a warm drink at a cozy café',
    };
  }

  // Clear/Sunny weather
  if (weatherSymbol === 1) {
    if (temperature >= 25) {
      return {
        emoji: '🏖️',
        activity: 'Beach Day',
        description: 'Perfect weather for the beach',
      };
    } else if (temperature >= 15) {
      return {
        emoji: '🚴',
        activity: 'Cycling',
        description: 'Great day for outdoor cycling',
      };
    } else if (temperature >= 5) {
      return {
        emoji: '🚶',
        activity: 'Walking',
        description: 'Nice weather for a walk in the park',
      };
    } else if (temperature < 0) {
      return {
        emoji: '⛸️',
        activity: 'Ice Skating',
        description: 'Cold and clear - perfect for ice skating',
      };
    } else {
      return {
        emoji: '🧥',
        activity: 'Outdoor Walk',
        description: 'Bundle up and enjoy the fresh air',
      };
    }
  }

  // Partly cloudy weather
  if (weatherSymbol === 2) {
    if (temperature >= 20) {
      return {
        emoji: '⚽',
        activity: 'Sports',
        description: 'Great weather for outdoor sports',
      };
    } else if (temperature >= 10) {
      return {
        emoji: '🏃',
        activity: 'Jogging',
        description: 'Perfect conditions for a run',
      };
    } else if (temperature >= 0) {
      return {
        emoji: '🚶',
        activity: 'Walking',
        description: 'Nice day for a walk',
      };
    } else {
      return {
        emoji: '⛷️',
        activity: 'Winter Sports',
        description: 'Good conditions for winter activities',
      };
    }
  }

  // Cloudy weather (default)
  if (temperature >= 15) {
    return {
      emoji: '🎾',
      activity: 'Outdoor Activities',
      description: 'Comfortable weather for various outdoor activities',
    };
  } else if (temperature >= 5) {
    return {
      emoji: '🚶',
      activity: 'Light Activity',
      description: 'Cool but okay for moderate outdoor activities',
    };
  } else if (temperature >= 0) {
    return {
      emoji: '☕',
      activity: 'Casual Outing',
      description: 'Chilly - dress warm for outdoor activities',
    };
  } else {
    return {
      emoji: '🏠',
      activity: 'Indoor Activities',
      description: 'Cold weather - consider indoor activities',
    };
  }
};
