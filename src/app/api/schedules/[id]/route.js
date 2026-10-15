import { NextResponse } from 'next/server';
import { getScheduleById, deleteSchedule } from '../../../../lib/storage';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const schedule = getScheduleById(id);
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    deleteSchedule(id);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
