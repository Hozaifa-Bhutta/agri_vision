"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface YieldRecord {
  username: string;
  county_state: string;
  crop_type: string;
  measurement_date: string;
  yieldacre: number;
}

function CropYieldContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User';
  const router = useRouter();
  const pathname = usePathname();

  const [county, setCounty] = useState<string>('');
  const [yields, setYields] = useState<YieldRecord[]>([]);
  const [newYield, setNewYield] = useState({
    crop_type: '',
    measurement_date: '',
    yieldacre: ''
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Add state for client-side rendering check

  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('CropYieldPage: Pathname changed:', pathname);
  }, [pathname]);

  // NEW: Fetch user info to get county
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`/api/GET?action=getUserInfo&username=${username}`);
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = (await res.json()).result;
        console.log("Fetched user county:", data.county_state);
        setCounty(data.county_state); // <-- Set county
      } catch (e: any) {
        console.error(e.message);
        setError('Could not fetch user info');
      }
    };

    fetchUserInfo();
  }, [username]);

  const fetchYields = async () => {
    const res = await fetch(`/api/GET?action=getYields&username=${username}`);
    const data: YieldRecord[] = (await res.json()).result;
    console.log("Fetched yields:", data);
    setYields(data);
  };

  useEffect(() => {
    fetchYields();
  }, [username]);

  const goToProfile = () => {
    router.push(`/profile?username=${username}`);
  };

  const handleLogout = () => {
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!newYield.crop_type || !newYield.measurement_date || !newYield.yieldacre) {
      setError("All fields must be filled.");
      return;
    }
    if (isNaN(Number(newYield.yieldacre)) || Number(newYield.yieldacre) <= 0) {
      setError("Yield must be a positive number.");
      return;
    }

    try {
      console.log("Submitting new yield:", {
        ...newYield,
        username,
        county
      });
      const res = await fetch('/api/POST', {  // Removed query parameter
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createYield',  // Put action in body instead
          params: {  // Nest data under params
            ...newYield,
            username,
            county_state: county  // Rename to match API expectation
          }
        })
      });
      const result = await res.json();
    


      if (res.ok) {
        setMessage("Yield saved successfully!");
        setNewYield({ crop_type: '', measurement_date: '', yieldacre: '' });
        fetchYields();
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
      {/* Navigation */}
      <div className="bg-green-500 p-4 flex items-center justify-between">
        <div className="text-white font-bold text-xl">AgriVision</div>
        <div className="flex space-x-4">
          <a href={`/county-data?username=${username}`} className="text-white hover:text-gray-200">County Data</a>
          <a href={`/crop-yield?username=${username}`} className="text-white hover:text-gray-200">Crop Yield</a>
          <a href={`/home?username=${username}`} className="text-white hover:text-gray-200">Home</a>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={goToProfile} className="text-white hover:text-gray-200">{username}</button>
          <button onClick={handleLogout} className="text-white hover:text-gray-200">Logout</button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl text-black">
          <h1 className="text-2xl font-bold mb-4">Crop Yield Page</h1>
          <p className="mb-6">County: <strong>{county}</strong></p>

          {/* Add New Yield Form */}
          <h2 className="text-xl font-semibold mb-2">Add New Yield</h2>

          {message && <div className="mb-2 text-green-600 font-semibold">{message}</div>}
          {error && <div className="mb-2 text-red-600 font-semibold">{error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 mb-6">
            <input type="text" placeholder="Crop Type" required className="border p-2 text-black"
              value={newYield.crop_type} onChange={(e) => setNewYield({ ...newYield, crop_type: e.target.value })} />
            <input type="month" required className="border p-2 text-black"
              value={newYield.measurement_date} onChange={(e) => setNewYield({ ...newYield, measurement_date: e.target.value })} />
            <input type="number" placeholder="Yield per Acre" required className="border p-2 text-black"
              value={newYield.yieldacre} onChange={(e) => setNewYield({ ...newYield, yieldacre: e.target.value })} />
            <button type="submit" className="col-span-3 bg-blue-500 text-white px-4 py-2 rounded">Save Yield</button>
          </form>

          {/* Yield Table */}
          <h2 className="text-xl font-semibold mb-2">Yield History</h2>
          <table className="w-full text-left border-collapse border border-gray-300 mb-6">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Crop</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Yield</th>
                <th className="border p-2">County</th>
              </tr>
            </thead>
            <tbody>
              {yields.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-black">{item.crop_type}</td>
                  <td className="border p-2 text-black">{item.measurement_date}</td>
                  <td className="border p-2 text-black">{item.yieldacre}</td>
                  <td className="border p-2 text-black">{item.county_state}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Chart - Only render on client side */}
          <h2 className="text-xl font-semibold mb-2">Yield Over Time</h2>
          {isMounted ? (
            <LineChart width={600} height={300} data={yields}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="measurement_date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="yieldacre" stroke="#8884d8" />
            </LineChart>
          ) : (
            <div className="w-[600px] h-[300px] bg-gray-100 flex items-center justify-center">
              Loading chart...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CropYieldPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CropYieldContent />
    </Suspense>
  );
}