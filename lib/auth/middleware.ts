import { z } from 'zod';
import { User } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

export async function validatedAction<T>(
  schema: z.ZodSchema<T>,
  action: (data: T) => Promise<ActionState | void>,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const data = schema.parse(rawData);
    const result = await action(data);
    return result || { success: 'Operation completed successfully' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function validatedActionWithUser<T>(
  schema: z.ZodSchema<T>,
  action: (data: T, formData: FormData, user: User) => Promise<ActionState | void>,
  formData: FormData,
  user: User
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const data = schema.parse(rawData);
    const result = await action(data, formData, user);
    return result || { success: 'Operation completed successfully' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function withAuth(action: (formData: FormData, user: User) => Promise<void>) {
  return async (formData: FormData) => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    return action(formData, user);
  };
}
