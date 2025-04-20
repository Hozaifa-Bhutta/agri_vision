// filepath: /Users/hozaifabhutta/Code/CS411/agri_vision/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo, updateUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Called during "fetch"
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ message: 'Missing username' }, { status: 400 });
    }

    const userInfo = await getUserInfo(username);

    if (!userInfo) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userInfo);

  } catch (error) {
    console.error('Failed to get user info', error);
    return NextResponse.json({ message: 'Failed to get user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) { 
  try {
    const { username, county_state } = await request.json();

    if (!username || !county_state) {
      return NextResponse.json({ message: 'Missing username or county_state' }, { status: 400 });
    }

    await updateUser(username, county_state);

    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update user', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}