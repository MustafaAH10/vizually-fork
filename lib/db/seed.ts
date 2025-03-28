import { stripe } from '../payments/stripe';
import { getDb } from './drizzle';
import { users } from './schema';
import { hash } from 'bcryptjs';
import { hashPassword } from '@/lib/auth/password';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function main() {
  const db = await getDb();
  
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  await db.insert(users).values({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash: adminPassword,
    role: 'admin',
  });

  console.log('Seed completed successfully');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
