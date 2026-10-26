import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { 
  getUserConnections, 
  getPendingConnectionRequests, 
  sendConnectionRequest 
} from '@/lib/connectionService';
import { SendConnectionSchema } from '@/lib/schema';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [connections, pending] = await Promise.all([
      getUserConnections(user.id),
      getPendingConnectionRequests(user.id),
    ]);

    return NextResponse.json({
      success: true,
      connections,
      pending,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = SendConnectionSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const firstErrorMessage = Object.values(fieldErrors).flat()[0] || 'Invalid inputs';
      return NextResponse.json(
        { success: false, error: firstErrorMessage, fieldErrors },
        { status: 400 }
      );
    }

    const { targetIdentifier } = validation.data;
    const connection = await sendConnectionRequest(user.id, targetIdentifier);

    return NextResponse.json({
      success: true,
      message: 'Connection request sent successfully',
      connection,
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send connection request' },
      { status: 400 }
    );
  }
}
