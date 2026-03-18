import { NextResponse } from 'next/server';
import { getAllStats } from '@/db';

export async function GET() {
  try {
    const stats = await getAllStats();
    return NextResponse.json(stats || {});
  } catch (error) {
    console.error('Error fetching all stats:', error);
    return NextResponse.json({});
  }
}
