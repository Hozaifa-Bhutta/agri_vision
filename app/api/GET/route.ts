import { NextRequest, NextResponse } from 'next/server';
import {
  getCounties,
  getUserInfo,
  getYieldsByUsername
} from '@/lib/db';
import { fetchWeatherLast7Days } from '@/lib/weather';
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

      default:
        return NextResponse.json({ success: false, error: 'Unknown GET action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
