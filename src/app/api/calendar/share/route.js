import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = user.preferences || {};
    const receivedCalendars = preferences.receivedCalendars || [];

    return NextResponse.json({
      success: true,
      receivedCalendars,
    });
  } catch (error) {
    console.error('Error fetching received calendars:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const sender = await getAuthenticatedUser();
    if (!sender) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, events, message, calendarTitle } = body;

    if (!receiverId || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'Receiver ID and events array are required.' },
        { status: 400 }
      );
    }

    // Verify connection exists between users
    const connection = await prisma.connection.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: sender.id, receiverId },
          { senderId: receiverId, receiverId: sender.id },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'You can only share calendars with connected faculty peers.' },
        { status: 403 }
      );
    }

    // Find receiver user
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json({ success: false, error: 'Receiver not found' }, { status: 404 });
    }

    const receiverPreferences = receiver.preferences || {};
    const existingReceived = receiverPreferences.receivedCalendars || [];

    const newShareRecord = {
      shareId: `cshare-${Date.now()}`,
      calendarTitle: calendarTitle || 'Academic Blackout Calendar',
      message: message || '',
      sharedAt: new Date().toISOString(),
      sender: {
        id: sender.id,
        name: sender.name || 'Instructor',
        email: sender.email,
        department: sender.department || '',
      },
      eventsCount: events.length,
      events,
    };

    const updatedReceived = [newShareRecord, ...existingReceived.filter((s) => s.shareId !== newShareRecord.shareId)];

    await prisma.user.update({
      where: { id: receiverId },
      data: {
        preferences: {
          ...receiverPreferences,
          receivedCalendars: updatedReceived,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Academic calendar shared with ${receiver.name || receiver.email} successfully!`,
    });
  } catch (error) {
    console.error('Error sharing calendar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to share calendar' },
      { status: 500 }
    );
  }
}
