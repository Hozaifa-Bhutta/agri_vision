import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db'; // Import the createUser function

export async function POST(request: Request) {
  try {
    const { username, password, county_state } = await request.json();

    // Basic validation
    if (!username || !password || !county_state) {
      return new NextResponse(JSON.stringify({ message: 'Missing username, password, or county' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    try {
      // Create the new user in the database
      await createUser(username, password, county_state);

      return new NextResponse(JSON.stringify({ message: 'User registered successfully' }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (dbError: any) { // Explicitly type dbError as any
      console.error('Database error:', dbError);
      if (dbError.message === 'User already exists') {
        return new NextResponse(JSON.stringify({ message: 'User already exists' }), {
          status: 400, // Use 400 for bad request
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      return new NextResponse(JSON.stringify({ message: 'Failed to create user' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return new NextResponse(JSON.stringify({ message: 'An error occurred during signup' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}