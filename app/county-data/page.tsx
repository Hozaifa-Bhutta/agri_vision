"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function CountyDataContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "User";
  const router = useRouter();
  const pathname = usePathname();

  // Dropdown counties
  const [counties, setCounties] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>("");

  // User's county
  const [county, setCounty] = useState<string>("");  
  const [error, setError] = useState<string>("");

  // Soil Data for both sides
  const [userSoilData, setUserSoilData] = useState<any[]>([]);
  const [selectedSoilData, setSelectedSoilData] = useState<any[]>([]);

  // --- Fetch Functions ---

  const fetchCounties = async () => {
    try {
      const res = await fetch(`/api/yourEndpoint?action=getCounties`);
      const data = await res.json();
      if (data.success) {
        setCounties(data.result);
      }
    } catch (error) {
      console.error("Failed to fetch counties:", error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`/api/GET?action=getUserInfo&username=${username}`);
      if (!res.ok) throw new Error('Failed to fetch user info');
      const data = (await res.json()).result;
      console.log("Fetched user county:", data.county_state);
      setCounty(data.county_state);

      fetchUserCountyData(data.county_state);
    } catch (e: any) {
      console.error(e.message);
      setError('Could not fetch user info');
    }
  };

  const fetchUserCountyData = async (countyState: string) => {
    try {
      const soilRes = await fetch(`/api/GET?action=getSoilData&county=${encodeURIComponent(countyState)}`);
      const soilData = await soilRes.json();
      setUserSoilData(soilData.result || []);
    } catch (error) {
      console.error("Failed to fetch user county soil data:", error);
    }
  };

  const fetchSelectedCountyData = async (countyState: string) => {
    try {
      const soilRes = await fetch(`/api/GET?action=getSoilData&county=${encodeURIComponent(countyState)}`);
      const soilData = await soilRes.json();
      setSelectedSoilData(soilData.result || []);
    } catch (error) {
      console.error("Failed to fetch selected county soil data:", error);
    }
  };

  // --- UseEffect to Load on Page Load ---

  useEffect(() => {
    console.log("CountyDataPage: Pathname changed:", pathname);
    fetchCounties();
    fetchUserInfo();
  }, [pathname]);

  // --- Navigation Functions ---

  const goToProfile = () => {
    router.push(`/profile?username=${username}`);
  };

  const handleLogout = () => {
    router.push("/");
  };

  // --- Page Render ---

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navigation Menu */}
      <div className="bg-green-500 p-4 flex items-center justify-between">
        <div className="text-white font-bold text-xl">AgriVision</div>
        <div className="flex space-x-4">
          <a href={`/county-data?username=${username}`} className="text-white hover:text-gray-200">
            County Data
          </a>
          <a href={`/crop-yield?username=${username}`} className="text-white hover:text-gray-200">
            Crop Yield
          </a>
          <a href={`/home?username=${username}`} className="text-white hover:text-gray-200">
            Home
          </a>
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

      {/* Page Content */}
      <div className="flex flex-grow w-full h-full">
        {/* Left County Card */}
        <div className="flex flex-col justify-start items-start flex-1 bg-white p-8 m-4 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">
            {county ? county : "County 1 Data"}
          </h2>

          {/* Soil Data Table */}
          <h3 className="text-lg font-semibold mt-8 mb-2">Soil Data</h3>
          <div className="overflow-x-auto w-full">
            <table className="table-auto w-full text-sm border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Soil Org Carbon Stock</th>
                  <th className="border p-2">Bulk Density</th>
                  <th className="border p-2">Nitrogen</th>
                  <th className="border p-2">Soil Org Carbon</th>
                  <th className="border p-2">pH Water</th>
                </tr>
              </thead>
              <tbody>
                {userSoilData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border p-2">{item.soil_org_carbon_stock}</td>
                    <td className="border p-2">{item.bulk_density}</td>
                    <td className="border p-2">{item.nitrogen}</td>
                    <td className="border p-2">{item.soil_org_carbon}</td>
                    <td className="border p-2">{item.pH_water}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right County Card */}
        <div className="flex flex-col justify-start items-start flex-1 bg-white p-8 m-4 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">
            {selectedCounty ? selectedCounty : "County 2 Data"}
          </h2>

          {/* Dropdown to select county */}
          <label className="mb-2 text-gray-700" htmlFor="countyDropdown">Select a County:</label>
          <select
            id="countyDropdown"
            className="border rounded p-2 w-full mb-4"
            value={selectedCounty}
            onChange={(e) => {
              const countyName = e.target.value;
              setSelectedCounty(countyName);
              if (countyName) {
                fetchSelectedCountyData(countyName);
              }
            }}
          >
            <option value="">-- Select a County --</option>
            {counties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>

          {/* Soil Data Table */}
          <h3 className="text-lg font-semibold mt-8 mb-2">Soil Data</h3>
          <div className="overflow-x-auto w-full">
            <table className="table-auto w-full text-sm border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Soil Org Carbon Stock</th>
                  <th className="border p-2">Bulk Density</th>
                  <th className="border p-2">Nitrogen</th>
                  <th className="border p-2">Soil Org Carbon</th>
                  <th className="border p-2">pH Water</th>
                </tr>
              </thead>
              <tbody>
                {selectedSoilData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border p-2">{item.soil_org_carbon_stock}</td>
                    <td className="border p-2">{item.bulk_density}</td>
                    <td className="border p-2">{item.nitrogen}</td>
                    <td className="border p-2">{item.soil_org_carbon}</td>
                    <td className="border p-2">{item.pH_water}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CountyDataPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CountyDataContent />
    </Suspense>
  );
}
