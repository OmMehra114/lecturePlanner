import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { sendLecturePlan, getReceivedPlans } from '@/lib/planService';
import { SharePlanSchema } from '@/lib/schema';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const shares = await getReceivedPlans(user.id);
    return NextResponse.json({ success: true, shares });
  } catch (error) {
    console.error('Error fetching received plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch shares' },
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
    const validation = SharePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || 'Invalid share payload' },
        { status: 400 }
      );
    }

    const { planId, receiverId, message, permission } = validation.data;
    const share = await sendLecturePlan({
      planId,
      senderId: user.id,
      receiverId,
      message,
      permission,
    });

    return NextResponse.json({
      success: true,
      message: 'Lecture plan shared successfully!',
      share,
    });
  } catch (error) {
    console.error('Error sharing plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to share plan' },
      { status: 400 }
    );
  }
}
