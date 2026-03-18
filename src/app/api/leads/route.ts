import { NextRequest, NextResponse } from 'next/server';
import { saveLead, getLeads } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const { formId, name, whatsapp, email } = await request.json();

    if (!formId) {
      return NextResponse.json({ error: 'formId is required' }, { status: 400 });
    }

    await saveLead(formId, name || '', whatsapp || '', email || '');
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId') || undefined;
    const leads = await getLeads(formId);
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
