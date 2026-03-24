import { NextRequest, NextResponse } from 'next/server';
import { getFormStats, clearResponses } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const from = request.nextUrl.searchParams.get('from') ?? undefined;
    const to = request.nextUrl.searchParams.get('to') ?? undefined;
    const stats = await getFormStats(formId, from, to);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    await clearResponses(formId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing responses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
