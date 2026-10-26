import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { getUserLecturePlans, saveLecturePlan, formatPlanForClient } from '@/lib/planService';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: true, schedules: [] });
    }

    const plans = await getUserLecturePlans(user.id);
    return NextResponse.json({ success: true, schedules: plans.map(formatPlanForClient) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body || !body.meta || !body.topics) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: meta and topics required.' },
        { status: 400 }
      );
    }

    const saved = await saveLecturePlan(user.id, body);
    return NextResponse.json({ success: true, schedule: formatPlanForClient(saved) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
