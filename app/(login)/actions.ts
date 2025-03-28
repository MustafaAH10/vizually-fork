'use server';

import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  type NewUser,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  redirect: z.string().optional(),
});

type SignUpData = z.infer<typeof signUpSchema>;

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  redirect: z.string().optional(),
});

type SignInData = z.infer<typeof signInSchema>;

export async function signUp(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const data = signUpSchema.parse(rawData);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email already registered');
    }

    const passwordHash = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'member',
      })
      .returning();

    await setSession(user);
    redirect(data.redirect || '/dashboard');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create account. Please try again.');
  }
}

export async function signIn(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const data = signInSchema.parse(rawData);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await comparePasswords(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    await setSession(user);
    redirect(data.redirect || '/dashboard');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to sign in. Please try again.');
  }
}

export async function signOut() {
  try {
    await setSession(null);
    redirect('/sign-in');
  } catch (error) {
    console.error('Sign out error:', error);
    redirect('/sign-in');
  }
}
