import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function setSubscriptionStatus(userId: string, status: 'active' | 'inactive', periodEnd?: number) {
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      subscription_status: status,
      subscription_period_end: periodEnd ?? null,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await setSubscriptionStatus(userId, 'active', (sub as unknown as { current_period_end: number }).current_period_end);
        // Save trial_ends_at so the UI can show the trial countdown
        if (sub.status === 'trialing' && sub.trial_end) {
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { trial_ends_at: sub.trial_end * 1000 },
          });
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        await setSubscriptionStatus(userId, isActive ? 'active' : 'inactive');
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) await setSubscriptionStatus(userId, 'inactive');
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
  }

  return NextResponse.json({ received: true });
}
