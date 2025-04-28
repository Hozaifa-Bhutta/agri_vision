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
  const [isMounted, setIsMounted] = useState(false);
  const [averageData, setAverageData] = useState<{ avg_yield: number, avg_precipitation: number } | null>(null);
  

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`/api/GET?action=getUserInfo&username=${username}`);
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = (await res.json()).result;
        setCounty(data.county_state);
      } catch (e: any) {
        setError('Could not fetch user info');
      }
    };
    fetchUserInfo();
  }, [username]);

  const fetchYields = async () => {
    const res = await fetch(`/api/GET?action=getYields&username=${username}`);
    const data: YieldRecord[] = (await res.json()).result;
    setYields(data);
  };

  useEffect(() => { fetchYields(); }, [username]);

  const goToProfile = () => { router.push(`/profile?username=${username}`); };

  const handleLogout = () => { router.push('/'); };

  const handleEdit = async (item: YieldRecord) => {
    const newYieldAmount = prompt(`Enter new yield amount for ${item.crop_type} (${item.measurement_date}):`, item.yieldacre.toString());
    if (newYieldAmount === null) return;
    if (isNaN(Number(newYieldAmount)) || Number(newYieldAmount) <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      const res = await fetch('/api/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'editYield',
          params: {
            username: item.username,
            county_state: item.county_state,
            crop_type: item.crop_type,
            measurement_date: item.measurement_date,
            yieldacre: Number(newYieldAmount),
          },
        }),
      });

      if (res.ok) {
        setMessage("Yield updated successfully!");
        fetchYields();
      } else {
        const result = (await res.json()).result;
        setError(result.error || "Something went wrong while editing.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred while editing.");
    }
  };

  const handleDelete = async (item: YieldRecord) => {
    try {
      const res = await fetch('/api/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteYield',
          params: {
            username,
            crop_type: item.crop_type,
            measurement_date: item.measurement_date,
            county_state: item.county_state,
          },
        }),
      });
      if (res.ok) {
        setMessage("Yield deleted successfully!");
        fetchYields();
      } else {
        const result = (await res.json()).result;
        setError(result.error || "Something went wrong while deleting.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred while deleting.");
    }
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
      const res = await fetch('/api/POST', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createYield',
          params: {
            username,
            county_state: county,
            crop_type: newYield.crop_type,
            measurement_date: newYield.measurement_date,
            yieldacre: Number(newYield.yieldacre),
          },
        }),
      });

      if (res.ok) {
        setMessage("Yield saved successfully!");
        setNewYield({ crop_type: '', measurement_date: '', yieldacre: '' });
        fetchYields();
      } else {
        const result = await res.json();
        setError(result.error || "Something went wrong.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    }
  };

  const handleSeeAverage = async () => {
    try {
      const res = await fetch(`/api/GET?action=cropAdvancedQuery&username=${username}`);
      if (!res.ok) throw new Error('Failed to fetch averages');
  
      const data = await res.json();
      console.log("advanced data: ", data);
  
      if (res.ok) {
        const match = data.result.find((item: any) => item.county_state?.toLowerCase() === county.toLowerCase());
  
        if (match) {
          setAverageData({
            avg_yield: match.avg_yield,
            avg_precipitation: match.avg_precipitation
          });
        } else {
          setAverageData(null);
        }
      } else {
        setAverageData(null);
      }
    } catch (error) {
      console.error(error);
      setAverageData(null);
    }
  };

  const handleExitAverage = () => {
    setAverageData(null);
  };

  const handleAdminComparison = async () => {
    try {
      const res = await fetch(`/api/GET?action=cropAdminComparison&username=${username}&countyState=${county}`);
      if (!res.ok) throw new Error('Failed to fetch admin comparison');
  
      const data = await res.json();
      console.log("FULL admin API response: ", data);
      console.log("Result field only: ", data.result);
  
      if (res.ok) {
        const result = data.result;
        if (result) {
          const adminPoints: YieldRecord[] = [];
  
          const flattenedResult = result.flat();
  
          flattenedResult.forEach((item: any) => {
            adminPoints.push({
              username: username,
              county_state: county,
              crop_type: item.crop_type,
              measurement_date: "User Average",
              yieldacre: item.user_avg_yield,
            });
            adminPoints.push({
              username: "ADMINISTRATOR",
              county_state: county,
              crop_type: item.crop_type,
              measurement_date: "Admin Average",
              yieldacre: item.admin_avg_yield,
            });
          });
  
          setYields(prev => [...prev, ...adminPoints]);
        }
      }
    } catch (error) {
      console.error("Error fetching admin comparison: ", error);
    }
  };

  const sortedYields = [...yields].sort((a, b) => {
    if (a.measurement_date.includes("Average") && !b.measurement_date.includes("Average")) return 1;
    if (!a.measurement_date.includes("Average") && b.measurement_date.includes("Average")) return -1;
    return a.measurement_date.localeCompare(b.measurement_date);
  });
  const uniqueCrops = Array.from(new Set(sortedYields.map(y => y.crop_type)));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
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
  
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl text-black">
          <h1 className="text-2xl font-bold mb-4">Crop Yield Page</h1>
          <p className="mb-6">County: <strong>{county}</strong></p>
  
          <h2 className="text-xl font-semibold mb-2">Add New Yield</h2>
  
          {message && <div className="mb-2 text-green-600 font-semibold">{message}</div>}
          {error && <div className="mb-2 text-red-600 font-semibold">{error}</div>}
  
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 mb-6">
            <select
              required
              className="border p-2 text-black"
              value={newYield.crop_type}
              onChange={(e) => setNewYield({ ...newYield, crop_type: e.target.value })}
            >
              <option value="" disabled>Select Crop</option>
              <option value="corn">Corn</option>
              <option value="soybeans">Soybeans</option>
            </select>
  
            <input
              type="month"
              required
              className="border p-2 text-black"
              value={newYield.measurement_date}
              onChange={(e) => setNewYield({ ...newYield, measurement_date: e.target.value })}
            />
  
            <input
              type="number"
              placeholder="Yield per Acre"
              required
              className="border p-2 text-black"
              value={newYield.yieldacre}
              onChange={(e) => setNewYield({ ...newYield, yieldacre: e.target.value })}
            />
  
            <div className="col-span-3 flex space-x-4">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save Yield</button>
              <button type="button" onClick={handleSeeAverage} className="bg-purple-500 text-white px-4 py-2 rounded">See Average</button>
              <button type="button" onClick={handleAdminComparison} className="bg-indigo-500 text-white px-4 py-2 rounded">Admin?</button>
            </div>
          </form>
  
          {averageData && (
            <div className="bg-purple-100 p-6 rounded-lg shadow-md mb-6 relative">
              <button
                onClick={handleExitAverage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-2 py-1 text-xs"
              >
                Exit
              </button>
              <h2 className="text-2xl font-semibold text-purple-800 mb-2">Your County Averages</h2>
              <p className="text-lg text-purple-700">Average Yield: <span className="font-bold">{averageData.avg_yield} bu/acre</span></p>
              <p className="text-lg text-purple-700">Average Precipitation: <span className="font-bold">{averageData.avg_precipitation} mm</span></p>
            </div>
          )}
  
          <h2 className="text-xl font-semibold mb-2">Yield History</h2>
          <table className="w-full text-left border-collapse border border-gray-300 mb-6">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Crop</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Yield</th>
                <th className="border p-2">County</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedYields.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-black">{item.crop_type}</td>
                  <td className="border p-2 text-black">{item.measurement_date}</td>
                  <td className="border p-2 text-black">{item.yieldacre}</td>
                  <td className="border p-2 text-black">{item.county_state}</td>
                  <td className="border p-2 flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-2 rounded">Edit</button>
                    <button onClick={() => handleDelete(item)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  
          <h2 className="text-xl font-semibold mb-2">Yield Over Time</h2>
          {isMounted ? (
            <LineChart width={600} height={300} data={sortedYields}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="measurement_date" />
              <YAxis />
              <Tooltip />
              {uniqueCrops.map((crop) => (
                <Line
                  key={crop}
                  type="monotone"
                  dataKey={(d: any) => d.crop_type === crop ? d.yieldacre : null}
                  name={crop}
                  connectNulls
                />
              ))}
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