import { NextRequest, NextResponse } from 'next/server';
import { saveResponse } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const { formId, step, answer } = await request.json();

    if (!formId || !step || !answer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!['sim', 'nao'].includes(answer)) {
      return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
    }

    await saveResponse(formId, step, answer);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
