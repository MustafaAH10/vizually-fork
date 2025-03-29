import { SignJWT, jwtVerify } from 'jose';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is not set');
}

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

type SessionData = {
  user: { id: number };
  expires: string;
};

export async function signToken(payload: SessionData) {
  try {
    if (!payload.user?.id) {
      throw new Error('Invalid session data: user ID is required');
    }

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

export async function verifyToken(input: string | null | undefined): Promise<SessionData | null> {
  try {
    if (!input) {
      return null;
    }

    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });

    if (!payload || typeof payload !== 'object' || !('user' in payload) || !('expires' in payload)) {
      return null;
    }

    return payload as SessionData;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
} 