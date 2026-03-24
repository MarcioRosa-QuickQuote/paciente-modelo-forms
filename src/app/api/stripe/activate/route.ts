import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId obrigatório' }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Sessão não concluída' }, { status: 400 });
    }

    const userId = session.metadata?.supabase_user_id;
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 400 });

    const updates: Record<string, unknown> = { subscription_status: 'active' };

    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      updates.subscription_period_end = (sub as unknown as { current_period_end: number }).current_period_end;
      if (sub.status === 'trialing' && sub.trial_end) {
        updates.trial_ends_at = sub.trial_end * 1000;
      }
    }

    await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: updates });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Activate error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
