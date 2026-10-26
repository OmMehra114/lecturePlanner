import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authSync';
import { respondToConnectionRequest } from '@/lib/connectionService';
import { RespondConnectionSchema } from '@/lib/schema';
import prisma from '@/lib/prisma';

export async function PATCH(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = RespondConnectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || 'Invalid status' },
        { status: 400 }
      );
    }

    const { status } = validation.data;
    const updated = await respondToConnectionRequest(id, user.id, status);

    return NextResponse.json({
      success: true,
      message: status === 'ACCEPTED' ? 'Connection accepted!' : 'Connection declined',
      connection: updated,
    });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update connection' },
      { status: 400 }
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

    // Check if user is sender or receiver of this connection
    const existing = await prisma.connection.findFirst({
      where: {
        id,
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Connection not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.connection.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Connection removed successfully',
    });
  } catch (error) {
    console.error('Error removing connection:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove connection' },
      { status: 500 }
    );
  }
}
