import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { getLecturePlanById, deleteLecturePlan, formatPlanForClient } from '@/lib/planService';

export async function GET(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const plan = await getLecturePlanById(id, user.id);
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Schedule not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true, schedule: formatPlanForClient(plan) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteLecturePlan(id, user.id);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
