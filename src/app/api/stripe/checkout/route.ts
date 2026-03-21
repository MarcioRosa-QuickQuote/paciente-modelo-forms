import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Create or retrieve Stripe customer
    const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customer = existing.data[0];
    if (!customer) {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/admin/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/admin`,
      metadata: { supabase_user_id: userId },
      locale: 'pt-BR',
      subscription_data: {
        metadata: { supabase_user_id: userId },
        trial_period_days: 3,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 });
  }
}
