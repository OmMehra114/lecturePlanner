import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from './prisma';

/**
 * Synchronizes the currently authenticated Clerk user with the PostgreSQL database.
 * If the user does not exist in the database (e.g., newly registered), they are created.
 * If they exist, their name, email, or avatar are kept in sync.
 *
 * @returns {Promise<import('@prisma/client').User | null>} The database user record
 */
export async function getAuthenticatedUser() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return null;
    }

    // Attempt fast lookup by clerkId
    let dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (dbUser) {
      return dbUser;
    }

    // If not found in DB, pull fresh user details from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const primaryEmail =
      clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      `${clerkId}@user.lectureplanner.local`;

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      'Instructor';

    const imageUrl = clerkUser.imageUrl || null;

    // Upsert into Neon DB
    dbUser = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: primaryEmail,
        name: fullName,
        imageUrl,
      },
      create: {
        clerkId,
        email: primaryEmail,
        name: fullName,
        imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.error('Error in getAuthenticatedUser / DB sync:', error);
    throw error;
  }
}

/**
 * Synchronize a user directly from a Clerk Webhook payload (e.g. user.created or user.updated)
 */
export async function syncUserFromWebhook(clerkData) {
  const { id: clerkId, email_addresses, first_name, last_name, username, image_url } = clerkData;

  const email = email_addresses?.[0]?.email_address || `${clerkId}@user.lectureplanner.local`;
  const name = [first_name, last_name].filter(Boolean).join(' ') || username || 'Instructor';

  return await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      name,
      imageUrl: image_url || null,
    },
    create: {
      clerkId,
      email,
      name,
      imageUrl: image_url || null,
    },
  });
}
