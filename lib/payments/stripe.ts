import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function createCheckoutSession({ priceId }: { priceId: string }) {
  const user = await getUser();
  if (!user) {
    window.location.href = '/sign-in?redirect=checkout&priceId=' + priceId;
    return;
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.BASE_URL}/pricing?canceled=true`,
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  window.location.href = session.url;
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}
