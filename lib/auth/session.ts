import { compare, hash } from 'bcryptjs';
import { NewUser } from '@/lib/db/schema';
import { getSessionCookie, setSessionCookie, verifyToken } from './server';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export async function getSession() {
  try {
    const session = await getSessionCookie();
    if (!session) return null;
    return await verifyToken(session);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function setSession(user: NewUser | null) {
  try {
    await setSessionCookie(user);
  } catch (error) {
    console.error('Error setting session:', error);
    throw new Error('Failed to set session');
  }
}
