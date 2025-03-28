'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession } from './stripe';
import { withAuth } from '@/lib/auth/middleware';

export const checkoutAction = withAuth(async (formData) => {
  const priceId = formData.get('priceId') as string;
  if (!priceId) {
    throw new Error('Price ID is required');
  }

  await createCheckoutSession({ priceId });
});
