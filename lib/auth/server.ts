'use server';

import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';
import { signToken, verifyToken } from './edge';

export async function getSessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  return sessionCookie?.value ?? null;
}

export async function setSessionCookie(user: NewUser | null) {
  const cookieStore = await cookies();
  
  if (!user) {
    cookieStore.delete('session');
    return;
  }

  if (!user.id) {
    throw new Error('User ID is required');
  }

  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = {
    user: { id: user.id },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  
  cookieStore.set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export { verifyToken, signToken }; 