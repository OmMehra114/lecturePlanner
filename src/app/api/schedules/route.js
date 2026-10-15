import { NextResponse } from 'next/server';
import { getAllSchedules, saveSchedule } from '../../../lib/storage';

export async function GET() {
  try {
    const schedules = getAllSchedules();
    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body || !body.meta || !body.topics) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: meta and topics required.' },
        { status: 400 }
      );
    }

    const saved = saveSchedule(body);
    return NextResponse.json({ success: true, schedule: saved });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
