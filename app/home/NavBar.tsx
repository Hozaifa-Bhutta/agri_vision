import React from 'react';
import { useRouter } from 'next/navigation';

interface NavBarProps {
  username: string;
}

const NavBar: React.FC<NavBarProps> = ({ username }) => {
  const router = useRouter();
  
  const goToProfile = () => {
    router.push(`/profile?username=${username}`); 
  };

  const handleLogout = () => {
    router.push('/');
  };
  
  return (
    <div className="bg-green-500 p-4 flex items-center justify-between">
      <div className="text-white font-bold text-xl">AgriVision</div>
      <div className="flex space-x-4 md:flex-row flex-col">
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
        <a href={`/home?username=${username}`} className="text-white hover:text-gray-200">Home</a>
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
  );
};

export default NavBar; 