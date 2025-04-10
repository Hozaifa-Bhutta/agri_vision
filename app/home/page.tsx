"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function HomePage() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User'; // Default to 'User' if no username is provided
  const router = useRouter();

  const goToProfile = () => {
    router.push(`/profile?username=${username}`); // Navigate to the profile page, passing the username as a query parameter
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Menu Bar */}
      <div className="bg-green-500 p-4 flex items-center justify-between">
        <div className="text-white font-bold text-xl">AgriVision</div>
        <div className="flex space-x-4">
          <a href="#" className="text-white hover:text-gray-200">Option 1</a>
          <a href="#" className="text-white hover:text-gray-200">Option 2</a>
          <a href="#" className="text-white hover:text-gray-200">Option 3</a>
        </div>
        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <button onClick={goToProfile} className="text-white hover:text-gray-200">
            {username}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded shadow-md">
          <h1 className="text-2xl font-semibold mb-4" style={{color: 'black'}}>Welcome Home!</h1>
          <p className="text-gray-700">You have successfully logged in.</p>
        </div>
      </div>
    </div>
  );
}