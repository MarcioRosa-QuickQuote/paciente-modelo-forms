import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { saveLead, getLeads } from '@/db';

async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return '';
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id || '';
}

export async function POST(request: NextRequest) {
  try {
    const { formId, name, whatsapp, email, utmSource, utmMedium, utmCampaign } = await request.json();

    if (!formId) {
      return NextResponse.json({ error: 'formId is required' }, { status: 400 });
    }

    await saveLead(formId, name || '', whatsapp || '', email || '', utmSource, utmMedium, utmCampaign);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId') || undefined;
    const leads = await getLeads(formId, userId || undefined);
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
