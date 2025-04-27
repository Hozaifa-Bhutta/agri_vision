import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherData {
  measurement_date: string;
  county_state: string;
  min_temp: number;
  max_temp: number;
  precipitation: number;
  humidity: number;
  wind: number;
  solar_radiation: number;
}

interface ClimateWidgetProps {
  county_state?: string;
  formatLocation?: (location: string | undefined) => string;
}

const ClimateWidget: React.FC<ClimateWidgetProps> = ({ county_state, formatLocation }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [county_state]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const celsiusToFahrenheit = (celsius: number) => {
    return (celsius * 9/5) + 32;
  };

  // Chart data
  const chartData = {
    labels: weatherData.map(day => formatDate(day.measurement_date)),
    // legend for line chart
    datasets: [
      {
        label: 'Max Temp (°F)',
        data: weatherData.map(day => Math.round(celsiusToFahrenheit(day.max_temp))),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Min Temp (°F)',
        data: weatherData.map(day => Math.round(celsiusToFahrenheit(day.min_temp))),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}°F`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°F)'
        }
      }
    },
    maintainAspectRatio: false,
  };

  // Get most recent weather data for display
  const latestWeather = weatherData.length > 0 ? weatherData[weatherData.length - 1] : null;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Latest Climate Data</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !county_state) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Latest Climate Data</h2>
        <p className="text-gray-700">
          {!county_state 
            ? "Please set your location to view climate data." 
            : `Unable to load climate data: ${error}`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Latest Climate Data</h2>
      
      {latestWeather ? (
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-800">
                  {Math.round(celsiusToFahrenheit(latestWeather.max_temp))}°F
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  / {Math.round(celsiusToFahrenheit(latestWeather.min_temp))}°F
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                {latestWeather.precipitation.toFixed(2)} mm
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="font-semibold">{Math.round(latestWeather.humidity)}%</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500">Wind</p>
              <p className="font-semibold">{Math.round(latestWeather.wind)} km/h</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-gray-500">Solar</p>
              <p className="font-semibold">{Math.round(latestWeather.solar_radiation)} W/m²</p>
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="text-xs text-gray-500 mt-4 text-right">
        Last 7 days • {formatLocation 
          ? formatLocation(county_state) 
          : county_state?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
      </div>
    </div>
  );
};

export default ClimateWidget; 