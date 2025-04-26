import React from 'react';

const AboutWidget: React.FC = () => {
  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-800 mb-4">About AgriVision</h2>
      <p className="text-gray-700">
        AgriVision helps farmers, agricultural experts, and policymakers explore 
        relationships between historical weather patterns and crop yields to support 
        data-driven decision-making for crop planning and resource management.
      </p>
    </div>
  );
};

export default AboutWidget; 