import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
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

type SessionData = {
  user: { id: number };
  expires: string;
};

export async function signToken(payload: SessionData) {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1 day from now')
      .sign(key);
  } catch (error) {
    console.error('Error signing token:', error);
    throw new Error('Failed to create session');
  }
}

export async function verifyToken(input: string) {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function getSession() {
  try {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    return await verifyToken(session);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function setSession(user: NewUser | null) {
  try {
    const cookieStore = await cookies();
    
    if (!user) {
      cookieStore.delete('session');
      return;
    }

    const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session: SessionData = {
      user: { id: user.id! },
      expires: expiresInOneDay.toISOString(),
    };
    const encryptedSession = await signToken(session);
    
    cookieStore.set('session', encryptedSession, {
      expires: expiresInOneDay,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  } catch (error) {
    console.error('Error setting session:', error);
    throw new Error('Failed to set session');
  }
}
