import { NextRequest, NextResponse } from 'next/server';
import {
  checkUser,
  createUser,
  updateUser,
  createYield,
  updateUserEntry,
  deleteUserEntry,
} from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, params } = body;

    switch (action) {
      case 'login': {
        const { username, password } = params;
        if (!username || !password) {
          return NextResponse.json(
            { success: false, error: 'Username and password are required' },
            { status: 400 }
          );
        }
        
        const user = await checkUser(username, password);
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Invalid credentials' },
            { status: 401 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          user: { 
            username: user.username,
            county_state: user.county_state 
          }
        });
      }

      case 'createUser': {
        const { username, password, county_state } = params;
        const result = await createUser(username, password, county_state);
        return NextResponse.json({ success: true, result });
      }

      case 'updateUser': {
        const { username, county_state } = params;
        const result = await updateUser(username, county_state);
        return NextResponse.json({ success: true, result });
      }
      case 'createYield': {
        // Handle create yield logic here
        const {crop_type, measurement_date, yieldacre, username, county_state} = params;
        if (!crop_type || !measurement_date || !yieldacre || !username || !county_state) {
          return NextResponse.json({ success: false, error: 'All fields must be filled.' }, { status: 400 });
        }
        const result = await createYield({crop_type, measurement_date, yieldacre, username, county_state});
        if (!result) {
          return NextResponse.json({ success: false, error: 'Failed to create yield' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Yield created successfully' });
      }
      case 'editYield': {
        const {username, county_state, crop_type, measurement_date, yieldacre} = params;
        if (!username || !county_state || !crop_type || !measurement_date || !yieldacre) {
          return NextResponse.json({ success: false, error: 'All fields must be filled.' }, { status: 400 });
        }
        const result = await updateUserEntry({username, county_state, crop_type, measurement_date, yieldacre});
        if (!result) {
          return NextResponse.json({ success: false, error: 'Failed to update yield' }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: 'Yield updated successfully' });
      }
      case `deleteYield`: {
        const {username, crop_type, measurement_date, county_state} = params;
        if (!username || !crop_type || !measurement_date || !county_state) {
          return NextResponse.json({ success: false, error: 'All fields must be filled.' }, { status: 400 });
        }
        const result = await deleteUserEntry({username, crop_type, measurement_date, county_state});
        if (!result) {
          return NextResponse.json({ success: false, error: 'Failed to delete yield' }, { status: 500 });
        }
        return NextResponse.json({ success: true, message: 'Yield deleted successfully' });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown POST action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
