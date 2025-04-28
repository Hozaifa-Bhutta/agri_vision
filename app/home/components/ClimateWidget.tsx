import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartOptions,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

interface WeatherData {
  measurement_date: string;
  min_temp: number;
  max_temp: number;
  precipitation: number;
  humidity: number;
  wind: number;
  solar_radiation: number;
}

interface ClimateWidgetProps {
  county_state: string;
  formatLocation: (location: string) => string;
}

const ClimateWidget: React.FC<ClimateWidgetProps> = ({ county_state, formatLocation }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!county_state) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch actual weather data here
        const response = await fetch(`/api/GET?action=getCurrentWeather&countyState=${encodeURIComponent(county_state)}`);
        if (!response.ok) throw new Error('Failed to fetch weather data');

        const data = await response.json();
        setWeatherData(data.result);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [county_state]);

  const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const chartData = {
    labels: weatherData.map(day => formatDate(day.measurement_date)),
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
        position: 'top',
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
          text: 'Temperature (°F)',
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Loading Climate Data...</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (!weatherData.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h2 className="text-lg font-medium text-gray-800 mb-4">No Weather Data Available</h2>
        <p className="text-gray-700">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Latest Climate Data</h2>
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="text-xs text-gray-500 mt-4 text-right">
        Last {weatherData.length} days • {formatLocation(county_state)}
      </div>
    </div>
  );
};

export default ClimateWidget;
