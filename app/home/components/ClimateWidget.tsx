import React, { useState, useEffect } from 'react'; // Add this import

const ClimateWidget: React.FC<ClimateWidgetProps> = ({ county_state, formatLocation }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false); // Set to false since we're pausing the API call
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Temporarily pause fetching weather data
    console.warn('Weather data fetching is paused to conserve API credits.');
    setWeatherData([]); // Clear any existing data

    // Uncomment the following block to re-enable weather data fetching
    /*
    const fetchWeatherData = async () => {
      if (!county_state) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/GET?action=getCurrentWeather&countyState=${encodeURIComponent(county_state)}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching weather data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.result) {
          // Sort weather data by date
          const sortedData = [...data.result].sort((a, b) => 
            new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
          );
          setWeatherData(sortedData);
        } else {
          setError(data.error || 'Failed to fetch weather data');
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    */
  }, [county_state]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const celsiusToFahrenheit = (celsius: number) => {
    return (celsius * 9) / 5 + 32;
  };

  const chartData = {
    labels: [],
    datasets: [],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°F)',
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Latest Climate Data</h2>
      <p className="text-gray-700">
        Weather data fetching is currently paused to conserve API credits. Please check back later.
      </p>
    </div>
  );
};

export default ClimateWidget;