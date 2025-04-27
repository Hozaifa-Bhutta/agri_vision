"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Select from 'react-select';
import { StylesConfig } from 'react-select';
import { FaUser, FaMapMarkerAlt, FaArrowLeft, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

// Midwestern state abbreviation to full name mapping
const stateAbbreviations: Record<string, string> = {
  'il': 'Illinois',
  'in': 'Indiana',
  'ia': 'Iowa',
  'ks': 'Kansas',
  'mi': 'Michigan',
  'mn': 'Minnesota',
  'mo': 'Missouri',
  'ne': 'Nebraska',
  'nd': 'North Dakota',
  'oh': 'Ohio',
  'sd': 'South Dakota',
  'wi': 'Wisconsin'
};

// Format county/state string to show full state name
// Format county/state string to show full state name
const formatCountyState = (countyState: string): string => {
  if (!countyState) return '';
  
  // Split by space instead of comma
  const parts = countyState.split(' ');
  
  if (parts.length < 2) return countyState;
  
  // Last part is the state abbreviation
  const stateAbbr = parts[parts.length - 1].toLowerCase();
  // Everything else is the county name
  const county = parts.slice(0, parts.length - 1).join(' ');
  
  // Convert county name to title case
  const titleCaseCounty = county.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Look up full state name or use the abbreviation if not found
  const fullStateName = stateAbbreviations[stateAbbr] || stateAbbr.toUpperCase();
  
  return `${titleCaseCounty} County, ${fullStateName}`;
};

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-green-600 rounded-full animate-pulse"></div>
          <div className="w-5 h-5 bg-green-700 rounded-full animate-pulse delay-100"></div>
          <div className="w-5 h-5 bg-green-800 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User';
  const [userInfo, setUserInfo] = useState<{ username: string; county_state: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [counties, setCounties] = useState<{ value: string; label: string }[]>([]); 
  const [selectedCounty, setSelectedCounty] = useState('');

  const goBack = () => {
    router.push(`/home?username=${username}`);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/GET?action=getUserInfo&username=${username}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.result) {
          setUserInfo(data.result);
          setSelectedCounty(data.result.county_state);
        } else {
          throw new Error(data.error || "Invalid user info response");
        }
      } catch (e: any) {
        console.error("Could not fetch user info", e);
        setError(e.message || "Could not fetch user info");
      }
    };
  
    const fetchCounties = async () => {
      try {
        const response = await fetch('/api/GET?action=getCounties');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.result)) {
          const formattedCounties = data.result.map((county: { county_state: string }) => ({
            value: county.county_state,
            label: formatCountyState(county.county_state),
          }));
          setCounties(formattedCounties);
        } else {
          throw new Error(data.error || "Invalid counties response");
        }
      } catch (error: any) {
        console.error('Error fetching counties:', error);
        setError(error.message || 'An error occurred while fetching counties');
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
      const response = await fetch('/api/POST', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateUser',
          params: { username: username, county_state: selectedCounty },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setUserInfo({ ...userInfo!, county_state: selectedCounty });
      setIsEditing(false);
    } catch (e: any) {
      console.error("Could not update user info", e);
      setError(e.message || "Could not update user info");
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setSelectedCounty(userInfo?.county_state || '');
  };

  const customStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'white',
      boxShadow: state.isFocused ? '0 0 0 2px #22c55e' : 'none',
      borderColor: state.isFocused ? '#22c55e' : '#D1D5DB',
      borderRadius: '0.5rem',
      '&:hover': {
        borderColor: '#22c55e',
      },
      minHeight: '42px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#22c55e' : state.isFocused ? '#dcfce7' : 'white',
      color: state.isSelected ? 'white' : 'black',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1f2937',
    }),
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-red-600 flex items-center border border-red-200">
          <div className="mr-3 text-2xl">⚠️</div>
          <div>
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-2xl font-semibold flex items-center text-green-700">
          <div className="mr-3 animate-spin">⟳</div>
          Loading user info...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <button 
        onClick={goBack} 
        className="absolute top-4 left-4 bg-white hover:bg-gray-100 text-green-700 
                   transition-all duration-300 font-semibold py-2 px-4 
                   rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 
                   focus:ring-offset-2 shadow-md flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Home
      </button>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
          <div className="inline-block p-4 rounded-full bg-white/10 mb-3">
            <FaUser size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-1">{userInfo.username}</h2>
          <p className="text-green-100">AgriVision Farmer</p>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <label className="block text-gray-500 text-sm font-medium mb-2 uppercase tracking-wide">
              Username
            </label>
            <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
              <FaUser className="text-green-600 mr-3" />
              <p className="text-gray-800 font-medium">{userInfo.username}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-medium mb-2 uppercase tracking-wide">
              Location
            </label>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="relative">
                  <FaMapMarkerAlt className="absolute top-3.5 left-3 text-green-600" />
                  <Select
                    id="county"
                    options={counties}
                    value={counties.find(option => option.value === selectedCounty)}
                    onChange={(selectedOption) => setSelectedCounty(selectedOption ? selectedOption.value : '')}
                    isSearchable
                    placeholder="Select a county"
                    styles={{
                      ...customStyles,
                      control: (base, state) => ({
                        ...customStyles.control(base, state),
                        paddingLeft: '30px',
                      }),
                    }}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={handleSaveClick}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium 
                             py-2 px-4 rounded-lg focus:outline-none focus:ring-2 
                             focus:ring-green-500 focus:ring-offset-2 transition-colors
                             flex items-center justify-center"
                  >
                    <FaSave className="mr-2" /> Save
                  </button>
                  <button 
                    onClick={handleCancelClick}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium
                             py-2 px-4 rounded-lg focus:outline-none focus:ring-2
                             focus:ring-gray-400 focus:ring-offset-2 transition-colors
                             flex items-center justify-center"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-green-600 mr-3" />
                  <p className="text-gray-800 font-medium">{formatCountyState(userInfo.county_state)}</p>
                </div>
                <button 
                  onClick={handleEditClick}
                  className="bg-green-100 hover:bg-green-200 text-green-700 
                           py-1.5 px-3 rounded-md text-sm font-medium 
                           focus:outline-none focus:ring-2 focus:ring-green-500 
                           transition-colors flex items-center"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}