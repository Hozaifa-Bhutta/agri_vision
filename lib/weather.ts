import axios from 'axios';

export const fetchWeatherLast7Days = async (countyState: string) => {
  try {
    const location = encodeURIComponent(countyState);
    const apiKey = "C4QDJYVKNGVQHVW4ZA52J86EC";

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/last7days?unitGroup=metric&key=${apiKey}&include=days`;

    const response = await axios.get(url);
    const weatherData = response.data.days.map((day: any) => ({
      measurement_date: day.datetime, // "2025-04-17"
      county_state: countyState,
      min_temp: day.tempmin,
      max_temp: day.tempmax,
      precipitation: day.precip,
      humidity: day.humidity,
      wind: day.windspeed,
      solar_radiation: day.solarradiation
    }));
    console.log('Weather data fetched successfully:', weatherData);
    return weatherData;

  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};
