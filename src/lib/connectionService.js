import prisma from './prisma';

/**
 * Service to manage peer connections between users
 */

/**
 * Send a connection request to another user by their user ID or email
 */
export async function sendConnectionRequest(senderId, targetIdentifier) {
  // Find receiver by ID or email
  const receiver = await prisma.user.findFirst({
    where: {
      OR: [
        { id: targetIdentifier },
        { email: targetIdentifier },
      ],
    },
  });

  if (!receiver) {
    throw new Error('User not found. Please verify the email address.');
  }

  if (receiver.id === senderId) {
    throw new Error('You cannot connect with yourself.');
  }

  // Check if connection already exists in either direction
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId, receiverId: receiver.id },
        { senderId: receiver.id, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    if (existing.status === 'ACCEPTED') {
      throw new Error('You are already connected with this user.');
    }
    if (existing.status === 'PENDING') {
      throw new Error('A connection request is already pending between you two.');
    }
    if (existing.status === 'BLOCKED') {
      throw new Error('Unable to connect with this user.');
    }

    // Re-open request if previously declined
    return await prisma.connection.update({
      where: { id: existing.id },
      data: {
        senderId,
        receiverId: receiver.id,
        status: 'PENDING',
      },
    });
  }

  return await prisma.connection.create({
    data: {
      senderId,
      receiverId: receiver.id,
      status: 'PENDING',
    },
    include: {
      receiver: { select: { id: true, name: true, email: true, imageUrl: true, department: true } },
    },
  });
}

/**
 * Accept or decline a connection request
 */
export async function respondToConnectionRequest(connectionId, receiverId, status) {
  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    throw new Error('Invalid status response. Must be ACCEPTED or DECLINED.');
  }

  const connection = await prisma.connection.findFirst({
    where: { id: connectionId, receiverId },
  });

  if (!connection) {
    throw new Error('Connection request not found or unauthorized.');
  }

  return await prisma.connection.update({
    where: { id: connectionId },
    data: { status },
  });
}

/**
 * Get all accepted connections for a user
 */
export async function getUserConnections(userId) {
  const connections = await prisma.connection.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, email: true, imageUrl: true, department: true } },
      receiver: { select: { id: true, name: true, email: true, imageUrl: true, department: true } },
    },
  });

  // Normalize so the connected peer is always the 'peer' object
  return connections.map((conn) => ({
    id: conn.id,
    connectedSince: conn.updatedAt,
    peer: conn.senderId === userId ? conn.receiver : conn.sender,
  }));
}

/**
 * Get pending connection requests (both received and sent)
 */
export async function getPendingConnectionRequests(userId) {
  const [received, sent] = await Promise.all([
    prisma.connection.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: { select: { id: true, name: true, email: true, imageUrl: true, department: true } },
      },
    }),
    prisma.connection.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: {
        receiver: { select: { id: true, name: true, email: true, imageUrl: true, department: true } },
      },
    }),
  ]);

  return { received, sent };
}

/**
 * Search users by name or email (excluding current user)
 */
export async function searchUsers(currentUserId, query) {
  if (!query || query.trim().length < 2) return [];

  return await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      department: true,
    },
    take: 10,
  });
}
