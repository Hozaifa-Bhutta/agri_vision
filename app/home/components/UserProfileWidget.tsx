import React from 'react';

interface UserProfileWidgetProps {
  username: string;
  location: string | undefined;
  formatLocation: (location: string | undefined) => string;
}

const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({ username, location, formatLocation }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Your Profile</h2>
      <p className="text-gray-700 mb-2">Username: {username}</p>
      <p className="text-gray-700">Location: {formatLocation(location)}</p>
    </div>
  );
};

export default UserProfileWidget; 