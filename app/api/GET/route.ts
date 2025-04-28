import { NextRequest, NextResponse } from 'next/server';
import {
  getCounties,
  getUserInfo,
  getYieldsByUsername,
  getAuditLogs,
  getSoilData,
  getAvailableDates,
  getClimateData,
  checkUser,
  cropAdvancedQuery,
  getAvgEnvData,
  getAdminCropComparison,
} from '@/lib/db';
import { fetchWeatherLast7Days } from '@/lib/weather';
import {fetchFarmingNews} from '@/lib/farmingNews';
import { get } from 'http';
import { count } from 'console';
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'getCounties': {
        const result = await getCounties();
        return NextResponse.json({ success: true, result });
      }

      case 'getUserInfo': {
        const username = searchParams.get('username');
        if (!username) {
          return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
        }
        const result = await getUserInfo(username);
        return NextResponse.json({ success: true, result });
      }
      case 'getCurrentWeather': {
        const countyState = searchParams.get('countyState');
        if (!countyState) {
          return NextResponse.json({ success: false, error: 'County and state are required' }, { status: 400 });
        }
        const weatherData = await fetchWeatherLast7Days(countyState);
        return NextResponse.json({ success: true, result: weatherData });
      }
      case 'getYields' : {
        const username = searchParams.get('username');
        if (!username) {
          return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
        }
        const result = await getYieldsByUsername(username);
        return NextResponse.json({ success: true, result });
      }
      
      case 'getAuditLogs': {
        const username = searchParams.get('username');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;
        if (!username) {
          return NextResponse.json({ message: 'Missing username' }, { status: 400 });
        }
        const auditLogs = await getAuditLogs(username, limit);
        return NextResponse.json({ success: true, result: auditLogs });
      }
      case 'getFarmingNews': {
        const countyState = searchParams.get('countyState');
        if (!countyState) {
          return NextResponse.json({ success: false, error: 'County and state are required' }, { status: 400 });
        }
        const newsData = await fetchFarmingNews(countyState);
        return NextResponse.json({ success: true, result: newsData });
      }
      case `getSoilData` : {
        const countyState = searchParams.get('countyState');
        if (!countyState) {
          return NextResponse.json({ success: false, error: 'County and state are required' }, { status: 400 });
        }
        const soilData = await getSoilData(countyState);
        return NextResponse.json({ success: true, result: soilData });
      }
      case 'getAvailableDates': {
        const countyState = searchParams.get('countyState');
        if (!countyState) {
          return NextResponse.json({ success: false, error: 'County and state are required' }, { status: 400 });
        }
        const dates = await getAvailableDates(countyState);
        console.log('Available dates:', dates);
        return NextResponse.json({ success: true, result: dates });
      }
      case 'getClimateData': {
        const countyState = searchParams.get('countyState');
        const measurementDate = searchParams.get('measurementDate');
        if (!countyState || !measurementDate) {
          return NextResponse.json({ success: false, error: 'County/state and measurement date are required' }, { status: 400 });
        }
        const climateData = await getClimateData(countyState, measurementDate);
        return NextResponse.json({ success: true, result: climateData });
      }
      case 'checkUser': {
        const username = searchParams.get('username');
        const password = searchParams.get('password');
        if (!username || !password) {
          return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
        }
        const result = await checkUser(username, password);
        if (result) {
          return NextResponse.json({ success: true, result });
        } else {
          return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }
      }
      case 'cropAdvancedQuery': {
        const username = searchParams.get('username');
        if (!username) {
          return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
        }
        const result = await cropAdvancedQuery(username);
        if (!result) {
          return NextResponse.json({ success: false, error: 'Failed to fetch crop data' }, { status: 500 });
        }
        return NextResponse.json({ success: true, result: result });
      }
      case 'getAvgEnvData': {
        const result = await getAvgEnvData();
        if (!result) {
          return NextResponse.json({ success: false, error: 'Failed to fetch average environmental data' }, { status: 500 });
        }
        return NextResponse.json({ success: true, result: result });
      }
      case 'cropAdminComparison' : {
        const username = searchParams.get('username');
        const countyState = searchParams.get('countyState');
        console.log("username: ", username);
        if (!username || !countyState) {
          return NextResponse.json({ success: false, error: 'Username and county/state are required' }, { status: 400 });
        }
        console.log("about to call getAdminCropComparison");
        const result = await getAdminCropComparison(username, countyState);
        if (!result) {
          return NextResponse.json({ success: false, error: 'Failed to fetch crop comparison data' }, { status: 500 });
        }
        return NextResponse.json({ success: true, result: result[0] });
      }



      default:
        return NextResponse.json({ success: false, error: 'Unknown GET action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
