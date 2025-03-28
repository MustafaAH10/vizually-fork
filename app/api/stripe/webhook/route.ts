import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (user.length === 0) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json(
            { error: 'User not found for customer' },
            { status: 404 }
          );
        }

        await db
          .update(users)
          .set({
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
          })
          .where(eq(users.id, user[0].id));
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (user.length === 0) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json(
            { error: 'User not found for customer' },
            { status: 404 }
          );
        }

        // You might want to send an email notification here
        console.log(`Trial ending soon for user: ${user[0].email}`);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, session.customer_email!))
          .limit(1);

        if (user.length === 0) {
          console.error('User not found for email:', session.customer_email);
          return NextResponse.json(
            { error: 'User not found for email' },
            { status: 404 }
          );
        }

        await db
          .update(users)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active',
          })
          .where(eq(users.id, user[0].id));
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
