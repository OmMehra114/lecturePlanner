import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { 
  getLecturePlanById, 
  saveLecturePlan, 
  deleteLecturePlan, 
  toggleFavoritePlan,
  duplicateLecturePlan,
  formatPlanForClient 
} from '@/lib/planService';

export async function GET(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 });
    }

    const plan = await getLecturePlanById(id, user.id);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Lecture plan not found or you do not have permission to view it.' },
        { status: 404 }
      );
    }

    const isOwner = plan.userId === user.id;

    return NextResponse.json({
      success: true,
      plan: formatPlanForClient(plan),
      isOwner,
    });
  } catch (error) {
    console.error('Error fetching lecture plan by ID:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch lecture plan' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action === 'favorite') {
      const updated = await toggleFavoritePlan(id, user.id);
      return NextResponse.json({
        success: true,
        isFavorite: updated.isFavorite,
      });
    }

    if (body.action === 'duplicate') {
      const duplicated = await duplicateLecturePlan(id, user.id);
      return NextResponse.json({
        success: true,
        message: 'Plan cloned successfully',
        plan: formatPlanForClient(duplicated),
      });
    }

    // Save/update plan topics and metadata
    const updated = await saveLecturePlan(user.id, {
      ...body,
      id,
    });

    return NextResponse.json({
      success: true,
      message: 'Lecture plan updated successfully',
      plan: formatPlanForClient(updated),
    });
  } catch (error) {
    console.error('Error updating lecture plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update lecture plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteLecturePlan(id, user.id);

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Lecture plan not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lecture plan deleted successfully from database',
    });
  } catch (error) {
    console.error('Error deleting lecture plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete lecture plan' },
      { status: 500 }
    );
  }
}
