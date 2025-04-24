"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic for client-only components
import { StylesConfig } from 'react-select';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import the Link component

// Dynamically import react-select with SSR disabled
const Select = dynamic(() => import('react-select'), { ssr: false });

// Define the County type
interface County {
  county_state: string;
}

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [counties, setCounties] = useState<{ value: string; label: string }[]>([]);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [signupError, setSignupError] = useState(''); // State for signup error message
  const router = useRouter();

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const response = await fetch('/api/GET?action=getCounties'); // Updated to use GET with action
        if (!response.ok) {
          console.error('Failed to fetch counties:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.result)) {
          // Format the counties data for react-select
          const formattedCounties = data.result.map((county: County) => ({
            value: county.county_state,
            label: county.county_state,
          }));
          setCounties(formattedCounties);
        } else {
          throw new Error(data.error || 'Invalid counties response');
        }
      } catch (error: any) {
        console.error('Error fetching counties:', error);
        setSignupError('An error occurred while fetching counties.');
      }
    };

    fetchCounties();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSignupError(''); // Clear any previous error messages

    if (!username || !password || !selectedCounty) {
      setSignupError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/POST', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createUser', // Updated to use POST with action
          params: {
            username,
            password,
            county_state: selectedCounty,
          },
        }),
      });

      if (response.ok) {
        // Signup successful, redirect to login page
        router.push('/');
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'User already exists') {
          setSignupError('Username already exists. Please choose a different username.');
        } else {
          console.error('Signup failed:', response.status);
          setSignupError('Signup failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setSignupError('An error occurred during signup.');
    }
  };

  // Custom styles to match the existing input fields
  const customStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (base, state) => ({
      ...base,
      boxShadow: state.isFocused ? '0 0 0 1px #4F46E5' : '0 0 0 1px #D1D5DB',
      borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB',
      '&:hover': {
        borderColor: '#4F46E5',
      },
    }),
    option: (base) => ({
      ...base,
      color: 'black', // Set text color to black
    }),
    singleValue: (base) => ({
      ...base,
      color: 'black', // Set text color to black
    }),
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'black' }}>Sign Up</h2>
        {signupError && (
          <div className="text-red-500 mb-4">
            {signupError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* County selection */}
          <div className="mb-6">
            <label htmlFor="county" className="block text-gray-700 text-sm font-bold mb-2">
              County:
            </label>
            <Select
              id="county"
              options={counties}
              value={counties.find(option => option.value === selectedCounty)}
              onChange={(selectedOption) => setSelectedCounty(selectedOption ? selectedOption.value : '')}
              isSearchable
              placeholder="Select a county"
              styles={customStyles}
            />
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Sign Up
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}