import { NextResponse } from 'next/server';
import { checkUser } from '@/lib/db'; // Import the checkUser function

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Validate input
    if (!username || !password) {
      return NextResponse.json({ message: 'Missing username or password' }, { status: 400 });
    }

    // 2. Check user credentials using the checkUser function
    const isValidUser = await checkUser(username, password);

    // 3. Handle authentication result
    if (isValidUser) {
      // Authentication successful
      return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    } else {
      // Authentication failed
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}