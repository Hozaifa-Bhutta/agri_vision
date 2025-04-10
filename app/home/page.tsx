"use client";

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function HomePageContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User';
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('HomePage: Pathname changed:', pathname);
  }, [pathname]);

  const goToProfile = () => {
    router.push(`/profile?username=${username}`); 
  };

  const handleLogout = () => {
    // Perform any necessary cleanup (e.g., clearing cookies, local storage)
    // Then redirect to the login page
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="bg-green-500 p-4 flex items-center justify-between">
        <div className="text-white font-bold text-xl">AgriVision</div>
        <div className="flex space-x-4">
          <a href="#" className="text-white hover:text-gray-200">Option 1</a>
          <a href="#" className="text-white hover:text-gray-200">Option 2</a>
          <a href="#" className="text-white hover:text-gray-200">Option 3</a>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={goToProfile} className="text-white hover:text-gray-200">
            {username}
          </button>
          <button onClick={handleLogout} className="text-white hover:text-gray-200">
            Logout
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded shadow-md">
          <h1 className="text-2xl font-semibold mb-4" style={{ color: 'black' }}>Welcome Home!</h1>
          <p className="text-gray-700">You have successfully logged in.</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}