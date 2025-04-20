import { NextResponse } from 'next/server';
import { getCounties } from '@/lib/db';

export async function GET() {
  try {
    const counties = await getCounties();
    return NextResponse.json(counties);
  } catch (error) {
    console.error('Error fetching counties:', error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch counties' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
