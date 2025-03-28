import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users } from './schema';
import { hash } from 'bcryptjs';

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

async function seed() {
  // Create a test user
  const passwordHash = await hash('password123', 10);
  const [user] = await db
    .insert(users)
    .values({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      role: 'admin',
    })
    .returning();

  console.log('Created test user:', user.email);

  await createStripeProducts();
}

seed()
  .then(() => {
    console.log('Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
