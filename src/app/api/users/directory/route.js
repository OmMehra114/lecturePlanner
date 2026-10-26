import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const departmentFilter = searchParams.get('department') || '';

    // Search filter conditions
    const whereCondition = {
      id: { not: currentUser.id },
    };

    if (query.trim()) {
      whereCondition.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { email: { contains: query.trim(), mode: 'insensitive' } },
        { department: { contains: query.trim(), mode: 'insensitive' } },
        { institution: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    if (departmentFilter.trim()) {
      whereCondition.department = { contains: departmentFilter.trim(), mode: 'insensitive' };
    }

    // 1. Fetch directory users
    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        department: true,
        institution: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // 2. Fetch connections involving current user to map relationship status
    const userConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id },
        ],
      },
    });

    // Map connection status for each user in directory
    const directoryWithStatus = users.map((u) => {
      const conn = userConnections.find(
        (c) =>
          (c.senderId === currentUser.id && c.receiverId === u.id) ||
          (c.senderId === u.id && c.receiverId === currentUser.id)
      );

      let status = 'NONE';
      let connectionId = null;

      if (conn) {
        connectionId = conn.id;
        if (conn.status === 'ACCEPTED') {
          status = 'CONNECTED';
        } else if (conn.status === 'PENDING') {
          status = conn.senderId === currentUser.id ? 'PENDING_SENT' : 'PENDING_RECEIVED';
        } else if (conn.status === 'DECLINED') {
          status = 'DECLINED';
        }
      }

      return {
        ...u,
        connectionStatus: status,
        connectionId,
      };
    });

    return NextResponse.json({
      success: true,
      users: directoryWithStatus,
      totalCount: directoryWithStatus.length,
    });
  } catch (error) {
    console.error('Error fetching users directory:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch directory' },
      { status: 500 }
    );
  }
}
