import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import prisma from '@/lib/prisma';
import { DEFAULT_HOLIDAYS } from '@/lib/holidays';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = user.preferences || {};
    const customEvents = preferences.calendarEvents || [];

    return NextResponse.json({
      success: true,
      defaultHolidays: DEFAULT_HOLIDAYS,
      customEvents,
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch calendar' },
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
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }

    const currentPreferences = user.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      calendarEvents: events,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { preferences: updatedPreferences },
    });

    return NextResponse.json({
      success: true,
      message: 'Calendar events saved successfully to database',
      events,
    });
  } catch (error) {
    console.error('Error saving calendar events:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save calendar events' },
      { status: 500 }
    );
  }
}
