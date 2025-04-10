"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Select from 'react-select'; // Import react-select
import { StylesConfig } from 'react-select';

export default function ProfilePage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User'; // Default to 'User' if no username is provided
  const [userInfo, setUserInfo] = useState<{ username: string; county_state: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [counties, setCounties] = useState<{ value: string; label: string }[]>([]); // State for counties
  const [selectedCounty, setSelectedCounty] = useState(''); // State for selected county

  const goBack = () => {
    router.push(`/home?username=${username}`);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/users?username=${username}`);
        if (!response.ok) {
            console.log("Response not ok:", response);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserInfo(data);
        setSelectedCounty(data.county_state); // Initialize selected county
      } catch (e: any) {
        console.error("Could not fetch user info", e);
        setError(e.message || "Could not fetch user info");
      }
    };

    const fetchCounties = async () => {
      try {
        const response = await fetch('/api/counties');
        if (response.ok) {
          const data = await response.json();
          // Format the counties data for react-select
          interface County {
            county_state: string;
          }

          const formattedCounties = data.map((county: County) => ({
            value: county.county_state,
            label: county.county_state
          }));
          setCounties(formattedCounties);
        } else {
          console.error('Failed to fetch counties:', response.status);
          setError('Failed to fetch counties. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching counties:', error);
        setError('An error occurred while fetching counties');
      }
    };

    fetchUserInfo();
    fetchCounties();
  }, [username]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch('/api/users', { // Assuming you have an API endpoint for updating user info
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, county_state: selectedCounty }),
      });

      if (!response.ok) {
        console.error("Response not ok:", response);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state with the new county
      setUserInfo({ ...userInfo!, county_state: selectedCounty });
      setIsEditing(false);
    } catch (e: any) {
      console.error("Could not update user info", e);
      setError(e.message || "Could not update user info");
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setSelectedCounty(userInfo?.county_state || ''); // Reset selected county
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-semibold">Loading user info...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button onClick={goBack} className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Back
      </button>
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'black' }}>User Profile</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username:
          </label>
          <p className="py-2 px-3 text-gray-700">{userInfo.username}</p>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            County:
          </label>
          {isEditing ? (
            <div>
              <Select
                id="county"
                options={counties}
                value={counties.find(option => option.value === selectedCounty)}
                onChange={(selectedOption) => setSelectedCounty(selectedOption ? selectedOption.value : '')}
                isSearchable
                placeholder="Select a county"
                styles={customStyles}
              />
              <button onClick={handleSaveClick} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">
                Save
              </button>
              <button onClick={handleCancelClick} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="py-2 px-3 text-gray-700">{userInfo.county_state}</p>
              <button onClick={handleEditClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}