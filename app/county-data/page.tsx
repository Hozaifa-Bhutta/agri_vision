"use client";

import React, { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function CountyDataPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User';
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('CountyDataPage: Pathname changed:', pathname);
  }, [pathname]);

  const goToProfile = () => {
    router.push(`/profile?username=${username}`);
  };

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navigation Menu */}
      <div className="bg-green-500 p-4 flex items-center justify-between">
        <div className="text-white font-bold text-xl">AgriVision</div>
        <div className="flex space-x-4">
          <a
            href={`/county-data?username=${username}`}
            className="text-white hover:text-gray-200"
          >
            County Data
          </a>
          <a
            href={`/crop-yield?username=${username}`}
            className="text-white hover:text-gray-200"
          >
            Crop Yield
          </a>
          <a href={`/home?username=${username}`} className="text-white hover:text-gray-200">
            Home
          </a>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToProfile}
            className="text-white hover:text-gray-200"
          >
            {username}
          </button>
          <button
            onClick={handleLogout}
            className="text-white hover:text-gray-200"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Page Content */}
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">County Data Page</h1>
          <p className="text-gray-700">
            Display county data here.
          </p>
        </div>
      </div>
    </div>
  );
}