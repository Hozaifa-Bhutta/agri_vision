import { NextRequest, NextResponse } from 'next/server';

// Mock data for audit logs
const mockAuditLogs = [
  {
    action_type: 'INSERT',
    action_timestamp: '2023-11-15T14:30:00Z',
    crop_type: 'Corn',
    measurement_date: '2023-09',
    county_state: 'will il',
    username: 'khamza',
    yieldacre: 185.5
  },
  {
    action_type: 'INSERT',
    action_timestamp: '2023-11-10T09:15:00Z',
    crop_type: 'Soybeans',
    measurement_date: '2023-09',
    county_state: 'will il',
    username: 'khamza',
    yieldacre: 65.2
  },
  {
    action_type: 'DELETE',
    action_timestamp: '2023-11-05T16:45:00Z',
    crop_type: 'Wheat',
    measurement_date: '2023-08',
    county_state: 'will il',
    username: 'khamza',
    yieldacre: 70.0
  },
  {
    action_type: 'INSERT',
    action_timestamp: '2023-10-25T11:20:00Z',
    crop_type: 'Wheat',
    measurement_date: '2023-08',
    county_state: 'will il',
    username: 'khamza',
    yieldacre: 72.3
  },
  {
    action_type: 'INSERT',
    action_timestamp: '2023-10-10T08:40:00Z',
    crop_type: 'Corn',
    measurement_date: '2023-07',
    county_state: 'will il',
    username: 'khamza',
    yieldacre: 180.2
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get username from query parameters
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

    if (!username) {
      return NextResponse.json({ message: 'Missing username' }, { status: 400 });
    }

    // Filter mock data by username and limit results - like a database query
    const userLogs = mockAuditLogs
      .filter(log => log.username === username)
      .slice(0, limit);

    // Simulate a short delay like a real query
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(userLogs);

  } catch (error) {
    console.error('Failed to get audit logs', error);
    return NextResponse.json({ message: 'Failed to get audit logs' }, { status: 500 });
  }
} 