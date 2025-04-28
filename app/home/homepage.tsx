"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import NavBar from './NavBar';
import { 
  UserProfileWidget, 
  ClimateWidget, 
  YieldsWidget, 
  AuditLogWidget, 
  AboutWidget,
  NewsWidget,
  AuditLogEntry
} from './components';

interface UserInfo {
  username: string;
  county_state: string;
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User';
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    console.log('HomePage: Pathname changed:', pathname);
  }, [pathname]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/GET?action=getUserInfo&username=${username}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.result) {
            setUserInfo(data.result);
          } else {
            console.error('Failed to fetch user info:', data.error || 'Unknown error');
          }
        } else {
          console.error('Failed to fetch user info:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserInfo();
    }
  }, [username]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLogsLoading(true);
        const response = await fetch(`/api/GET?action=getAuditLogs&username=${username}&limit=20`);
        
        if (response.ok) {
          const data = (await response.json()).result;
          console.log('Audit logs:', data);
          setAuditLogs(data);
        } else {
          console.error('Failed to fetch audit logs:', response.status);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLogsLoading(false);
      }
    };

    if (username) {
      fetchAuditLogs();
    }
  }, [username]);

  // To convert something like will il to Will County, Illinois
  const formatLocation = (location: string | undefined) => {
    if (!location) return 'Location not set';
    
    const parts = location.split(' ');
    
    if (parts.length < 2) return location; // Return as-is if format is unexpected
    
    // slice(1) to get all characters after the first character
    const county = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    
    const stateAbbr = parts[1].toUpperCase();
    
    const midwestStateNames: {[key: string]: string} = {
      'IL': 'Illinois',
      'IN': 'Indiana',
      'IA': 'Iowa',
      'KS': 'Kansas',
      'MI': 'Michigan',
      'MN': 'Minnesota',
      'MO': 'Missouri',
      'NE': 'Nebraska',
      'ND': 'North Dakota',
      'OH': 'Ohio',
      'SD': 'South Dakota',
      'WI': 'Wisconsin'
    };
    
    // Get the full state name or use the abbreviation if not found
    const stateFull = midwestStateNames[stateAbbr] || stateAbbr;
    
    return `${county} County, ${stateFull}`;
  };

  // Format date from ISO to user-friendly format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <NavBar username={username} />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'black' }}>
          Welcome Home, {username}!
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-700">Loading dashboard information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <UserProfileWidget 
              username={userInfo?.username || username} 
              location={userInfo?.county_state || ''} 
              formatLocation={formatLocation}
            /> */}
            <ClimateWidget 
              county_state={userInfo?.county_state || ''} 
              formatLocation={formatLocation}
            />
            {/* <YieldsWidget /> */}
            <AuditLogWidget 
              auditLogs={auditLogs} 
              loading={logsLoading} 
              formatDate={formatDate} 
            />
          </div>
        )}
        
        {/* News widget spans full width */}
        <div className="mt-6">
          <NewsWidget 
            county_state={userInfo?.county_state} 
            formatLocation={formatLocation}
          />
        </div>
        
        {/* <div className="mt-6">
          <AboutWidget />
        </div> */}
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