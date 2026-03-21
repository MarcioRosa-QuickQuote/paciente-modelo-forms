import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    if (!userEmail) return NextResponse.json({ error: 'E-mail não fornecido' }, { status: 400 });

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (!customers.data[0]) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${request.nextUrl.origin}/admin`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Erro ao abrir portal' }, { status: 500 });
  }
}
