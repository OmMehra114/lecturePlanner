import prisma from './prisma';

/**
 * Service to manage lecture plans in PostgreSQL (Neon DB)
 */

/**
 * Save or update a lecture plan and its associated topics
 */
export async function saveLecturePlan(userId, planData) {
  const { id, meta, topics, stats, isFavorite, status } = planData;

  const dataPayload = {
    subjectName: meta?.subjectName || 'Untitled Course',
    subjectCode: meta?.subjectCode || null,
    department: meta?.department || null,
    credits: Number(meta?.credits) || 3,
    totalHours: Number(meta?.totalHours) || 40,
    startDate: meta?.startDate || new Date().toISOString().split('T')[0],
    endDate: meta?.endDate || null,
    teachingDays: meta?.teachingDays || [1, 2, 3, 4, 5],
    includeFridays: meta?.includeFridays ?? true,
    fridayOption: meta?.fridayOption || 'full',
    customHolidays: meta?.customHolidays || [],
    syllabusRaw: meta?.syllabusText || null,
    stats: stats || {},
    status: status || 'SAVED',
    isFavorite: Boolean(isFavorite),
  };

  if (id) {
    // Check if plan exists and belongs to user
    const existing = await prisma.lecturePlan.findFirst({
      where: { id, userId },
    });

    if (existing) {
      // Update plan and re-sync topics inside a transaction
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.lecturePlan.update({
          where: { id },
          data: dataPayload,
        });

        if (Array.isArray(topics) && topics.length > 0) {
          // Delete old topics and recreate with current list
          await tx.lectureTopic.deleteMany({ where: { planId: id } });
          await tx.lectureTopic.createMany({
            data: topics.map((t, idx) => ({
              planId: id,
              srNo: t.srNo ?? idx + 1,
              unit: t.unit || null,
              topic: t.topic || `Topic ${idx + 1}`,
              subTopics: t.subTopics || [],
              lectures: Number(t.lectures) || 1,
              targetDates: t.targetDates || [],
              dateRange: t.dateRange || null,
              isOverflow: Boolean(t.isOverflow),
              completed: Boolean(t.completed),
              notes: t.notes || null,
            })),
          });
        }

        return await tx.lecturePlan.findUnique({
          where: { id },
          include: { topics: { orderBy: { srNo: 'asc' } } },
        });
      });
    }
  }

  // Create new plan with nested topics
  return await prisma.lecturePlan.create({
    data: {
      userId,
      ...dataPayload,
      topics: {
        create: (topics || []).map((t, idx) => ({
          srNo: t.srNo ?? idx + 1,
          unit: t.unit || null,
          topic: t.topic || `Topic ${idx + 1}`,
          subTopics: t.subTopics || [],
          lectures: Number(t.lectures) || 1,
          targetDates: t.targetDates || [],
          dateRange: t.dateRange || null,
          isOverflow: Boolean(t.isOverflow),
          completed: Boolean(t.completed),
          notes: t.notes || null,
        })),
      },
    },
    include: {
      topics: { orderBy: { srNo: 'asc' } },
    },
  });
}

/**
 * Get all lecture plans owned by the user
 */
export async function getUserLecturePlans(userId) {
  return await prisma.lecturePlan.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      topics: { orderBy: { srNo: 'asc' } },
      shares: {
        include: {
          receiver: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
    },
  });
}

/**
 * Get a specific lecture plan by ID (if owned or shared with the user)
 */
export async function getLecturePlanById(planId, userId) {
  const plan = await prisma.lecturePlan.findFirst({
    where: {
      id: planId,
      OR: [
        { userId },
        { shares: { some: { receiverId: userId } } },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true, department: true } },
      topics: { orderBy: { srNo: 'asc' } },
      shares: {
        include: {
          receiver: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
    },
  });

  return plan;
}

/**
 * Delete a lecture plan
 */
export async function deleteLecturePlan(planId, userId) {
  return await prisma.lecturePlan.deleteMany({
    where: {
      id: planId,
      userId,
    },
  });
}

/**
 * Share/Send a lecture plan to a connected user
 */
export async function sendLecturePlan({ planId, senderId, receiverId, message, permission = 'VIEW' }) {
  // Verify sender owns the plan
  const plan = await prisma.lecturePlan.findFirst({
    where: { id: planId, userId: senderId },
  });

  if (!plan) {
    throw new Error('Lecture plan not found or you do not have permission to share it.');
  }

  // Verify connection exists between users (ACCEPTED)
  const connection = await prisma.connection.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (!connection) {
    throw new Error('You can only send lecture plans to connected peers.');
  }

  return await prisma.planShare.create({
    data: {
      planId,
      senderId,
      receiverId,
      message,
      permission,
      status: 'PENDING',
    },
    include: {
      plan: true,
      receiver: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Get plans sent to the user by others
 */
export async function getReceivedPlans(userId) {
  return await prisma.planShare.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      plan: {
        include: {
          topics: { orderBy: { srNo: 'asc' } },
        },
      },
      sender: { select: { id: true, name: true, email: true, imageUrl: true, department: true } },
    },
  });
}

/**
 * Clear/delete all lecture plans for a user
 */
export async function clearAllUserLecturePlans(userId) {
  return await prisma.lecturePlan.deleteMany({
    where: { userId },
  });
}

/**
 * Toggle favorite flag on a plan
 */
export async function toggleFavoritePlan(planId, userId) {
  const plan = await prisma.lecturePlan.findFirst({
    where: { id: planId, userId },
  });

  if (!plan) {
    throw new Error('Plan not found or unauthorized');
  }

  return await prisma.lecturePlan.update({
    where: { id: planId },
    data: { isFavorite: !plan.isFavorite },
  });
}

/**
 * Duplicate / clone an existing plan
 */
export async function duplicateLecturePlan(planId, userId) {
  const original = await prisma.lecturePlan.findFirst({
    where: {
      id: planId,
      OR: [
        { userId },
        { shares: { some: { receiverId: userId } } },
      ],
    },
    include: { topics: { orderBy: { srNo: 'asc' } } },
  });

  if (!original) {
    throw new Error('Plan not found or unauthorized to clone');
  }

  return await prisma.lecturePlan.create({
    data: {
      userId,
      subjectName: `${original.subjectName} (Copy)`,
      subjectCode: original.subjectCode,
      department: original.department,
      credits: original.credits,
      totalHours: original.totalHours,
      startDate: original.startDate,
      endDate: original.endDate,
      teachingDays: original.teachingDays,
      includeFridays: original.includeFridays,
      fridayOption: original.fridayOption,
      customHolidays: original.customHolidays,
      syllabusRaw: original.syllabusRaw,
      stats: original.stats,
      status: 'SAVED',
      topics: {
        create: (original.topics || []).map((t) => ({
          srNo: t.srNo,
          unit: t.unit,
          topic: t.topic,
          subTopics: t.subTopics || [],
          lectures: t.lectures,
          targetDates: t.targetDates || [],
          dateRange: t.dateRange,
          isOverflow: t.isOverflow,
          completed: false,
          notes: t.notes,
        })),
      },
    },
    include: {
      topics: { orderBy: { srNo: 'asc' } },
    },
  });
}

/**
 * Normalizes a database LecturePlan model to the structure expected by the client UI
 */
export function formatPlanForClient(plan) {
  if (!plan) return null;
  return {
    id: plan.id,
    success: true,
    meta: {
      subjectName: plan.subjectName,
      subjectCode: plan.subjectCode || '',
      department: plan.department || '',
      credits: plan.credits || 3,
      totalHours: plan.totalHours || 40,
      startDate: plan.startDate,
      endDate: plan.endDate || '',
      teachingDays: plan.teachingDays || [1, 2, 3, 4, 5],
      includeFridays: plan.includeFridays ?? true,
      fridayOption: plan.fridayOption || 'full',
      customHolidays: plan.customHolidays || [],
      syllabusText: plan.syllabusRaw || '',
    },
    topics: (plan.topics || []).map((t) => ({
      srNo: t.srNo,
      unit: t.unit || '',
      topic: t.topic || '',
      subTopics: t.subTopics || [],
      lectures: t.lectures || 1,
      targetDates: t.targetDates || [],
      dateRange: t.dateRange || '',
      isOverflow: Boolean(t.isOverflow),
      completed: Boolean(t.completed),
      notes: t.notes || '',
    })),
    stats: plan.stats || {},
    status: plan.status,
    isFavorite: Boolean(plan.isFavorite),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    user: plan.user || null,
    shares: plan.shares || [],
  };
}

