import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { searchUsers } from '@/lib/connectionService';

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (query.trim().length < 2) {
      return NextResponse.json({ success: true, users: [] });
    }

    const users = await searchUsers(user.id, query);
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}
