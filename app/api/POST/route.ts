import { NextRequest, NextResponse } from 'next/server';
import {
  checkUser,
  createUser,
  updateUser,
} from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, params } = body;

    switch (action) {
      case 'checkUser': {
        const { username, password } = params;
        const result = await checkUser(username, password);
        return NextResponse.json({ success: true, result });
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

      default:
        return NextResponse.json({ success: false, error: 'Unknown POST action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
