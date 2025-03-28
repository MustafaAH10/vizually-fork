'use server';

import { desc, and, eq, isNull } from 'drizzle-orm';
import { getDb } from './drizzle';
import { users } from './schema';
import { verifyToken } from '@/lib/auth/server';
import { getSessionCookie } from '@/lib/auth/server';

export async function getUser() {
  const session = await getSessionCookie();
  if (!session) {
    return null;
  }

  const sessionData = await verifyToken(session);
  if (!sessionData?.user?.id) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const db = await getDb();
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, Number(sessionData.user.id)), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getUserById(userId: number) {
  const db = await getDb();
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  return result[0] || null;
}
