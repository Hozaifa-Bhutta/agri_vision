'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type {
  Props as SelectProps,
  StylesConfig,
  GroupBase
} from 'react-select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the shape of your API’s county objects
interface County {
  county_state: string;
}

// Define the option shape for react-select
interface SelectOption {
  value: string;
  label: string;
}

// Dynamically import react-select and give it the exact same generics
const Select = dynamic(
  () => import('react-select'),
  { ssr: false }
) as React.ComponentType<
  SelectProps<SelectOption, false, GroupBase<SelectOption>>
>;

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [counties, setCounties] = useState<SelectOption[]>([]);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [signupError, setSignupError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const response = await fetch('/api/GET?action=getCounties');
        if (!response.ok) {
          console.error('Failed to fetch counties:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.result)) {
          const formatted: SelectOption[] = data.result.map((c: County) => ({
            value: c.county_state,
            label: c.county_state,
          }));
          setCounties(formatted);
        } else {
          throw new Error(data.error || 'Invalid counties response');
        }
      } catch (err: any) {
        console.error('Error fetching counties:', err);
        setSignupError('An error occurred while fetching counties.');
      }
    };
    fetchCounties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!username || !password || !selectedCounty) {
      setSignupError('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('/api/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createUser',
          params: { username, password, county_state: selectedCounty },
        }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const errData = await res.json();
        if (res.status === 400 && errData.error === 'User already exists') {
          setSignupError('Username already exists. Please choose a different one.');
        } else {
          console.error('Signup failed:', res.status, errData);
          setSignupError('Signup failed. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setSignupError('An error occurred during signup.');
    }
  };

  const customStyles: StylesConfig<
    SelectOption,
    false,
    GroupBase<SelectOption>
  > = {
    control: (base, state) => ({
      ...base,
      boxShadow: state.isFocused
        ? '0 0 0 1px #4F46E5'
        : '0 0 0 1px #D1D5DB',
      borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB',
      '&:hover': { borderColor: '#4F46E5' },
    }),
    option: (base) => ({
      ...base,
      color: 'black',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'black',
    }),
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'black' }}>
          Sign Up
        </h2>

        {signupError && (
          <div className="text-red-500 mb-4">{signupError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username:
            </label>
            <input
              id="username"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="county"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              County:
            </label>
            <Select
              id="county"
              options={counties}
              value={
                counties.find((o) => o.value === selectedCounty) || null
              }
              onChange={(opt) =>
                setSelectedCounty(opt ? opt.value : '')
              }
              isSearchable
              placeholder="Select a county"
              styles={customStyles}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
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
