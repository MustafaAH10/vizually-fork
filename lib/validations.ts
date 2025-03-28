import { z } from 'zod';
import { User } from './db/schema';

type ValidationResult<T> = {
  error?: string;
  success?: string;
  data?: T;
};

export async function validatedAction<T>(
  schema: z.ZodSchema<T>,
  action: (data: T) => Promise<ValidationResult<T>>,
  formData: FormData
): Promise<ValidationResult<T>> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const data = schema.parse(rawData);
    return await action(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function validatedActionWithUser<T>(
  schema: z.ZodSchema<T>,
  action: (data: T, formData: FormData, user: User) => Promise<ValidationResult<T>>,
  formData: FormData,
  user: User
): Promise<ValidationResult<T>> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const data = schema.parse(rawData);
    return await action(data, formData, user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'An unexpected error occurred' };
  }
} 