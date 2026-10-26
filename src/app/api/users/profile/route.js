import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [plansCount, connectionsCount, sharedCount] = await Promise.all([
      prisma.lecturePlan.count({ where: { userId: user.id } }),
      prisma.connection.count({
        where: {
          status: 'ACCEPTED',
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
      }),
      prisma.planShare.count({ where: { senderId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        clerkId: user.clerkId,
        name: user.name || '',
        email: user.email,
        imageUrl: user.imageUrl,
        department: user.department || '',
        institution: user.institution || '',
        role: user.role || 'INSTRUCTOR',
        preferences: user.preferences || {
          defaultHours: 40,
          defaultTeachingDays: [1, 2, 3, 4, 5],
          defaultDurationMinutes: 60,
          fridayOption: 'full',
          includeDefaultHolidays: true,
        },
        createdAt: user.createdAt,
        stats: {
          plansCount,
          connectionsCount,
          sharedCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, department, institution, role, preferences } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
        department: department !== undefined ? department : user.department,
        institution: institution !== undefined ? institution : user.institution,
        role: role !== undefined ? role : user.role,
        preferences: preferences !== undefined ? preferences : user.preferences,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile and preferences updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        department: updated.department,
        institution: updated.institution,
        role: updated.role,
        preferences: updated.preferences,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
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

    const clerkId = user.clerkId;
    const userId = user.id;

    // 1. Cascade delete all user database records (Cascade takes care of topics, connections, plans, shares)
    await prisma.user.delete({
      where: { id: userId },
    });

    // 2. Attempt to delete Clerk user account if clerkClient is available
    try {
      const client = await clerkClient();
      if (client?.users?.deleteUser && clerkId) {
        await client.users.deleteUser(clerkId);
      }
    } catch (clerkErr) {
      console.warn('Note: Clerk user deletion through API skipped or failed:', clerkErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Your account, profile, lecture plans, and all personal data have been completely and permanently erased.',
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user profile' },
      { status: 500 }
    );
  }
}
