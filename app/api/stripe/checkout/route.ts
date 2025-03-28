import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { getDb } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session.customer_email) {
      throw new Error('No customer email found in session');
    }

    const db = await getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.customer_email))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    // Update user's subscription status
    await db
      .update(users)
      .set({
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        subscriptionStatus: session.subscription ? 'active' : 'inactive',
      })
      .where(eq(users.id, user[0].id));

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error processing checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout session' },
      { status: 500 }
    );
  }
}
