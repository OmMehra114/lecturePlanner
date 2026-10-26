import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { 
  getUserLecturePlans, 
  saveLecturePlan, 
  clearAllUserLecturePlans, 
  formatPlanForClient 
} from '@/lib/planService';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Strictly returns ONLY this user's saved lecture plans
    const rawPlans = await getUserLecturePlans(user.id);
    const plans = rawPlans.map(formatPlanForClient);

    return NextResponse.json({
      success: true,
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('Error fetching user lecture plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch lecture plans' },
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
    if (!body || (!body.meta && !body.topics)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan payload. Meta and topics are required.' },
        { status: 400 }
      );
    }

    const saved = await saveLecturePlan(user.id, body);
    const formatted = formatPlanForClient(saved);

    return NextResponse.json({
      success: true,
      message: 'Lecture plan saved to database successfully',
      plan: formatted,
    });
  } catch (error) {
    console.error('Error saving lecture plan to database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save lecture plan' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Clear all lecture plans belonging to this user
    await clearAllUserLecturePlans(user.id);

    return NextResponse.json({
      success: true,
      message: 'All your saved lecture plans have been successfully deleted from the database.',
    });
  } catch (error) {
    console.error('Error clearing user lecture plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear lecture plans' },
      { status: 500 }
    );
  }
}
