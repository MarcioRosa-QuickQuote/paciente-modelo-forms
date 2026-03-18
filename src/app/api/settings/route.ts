import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClinicSettings, upsertClinicSettings } from '@/db';

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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ clinicLogo: '', pixelId: '', capiToken: '' });

    const settings = await getClinicSettings(userId);
    return NextResponse.json({
      clinicLogo: settings?.clinic_logo || '',
      pixelId: settings?.pixel_id || '',
      capiToken: settings?.capi_token || '',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ clinicLogo: '', pixelId: '', capiToken: '' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    await upsertClinicSettings(userId, {
      clinic_logo: body.clinicLogo || '',
      pixel_id: body.pixelId || '',
      capi_token: body.capiToken || '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
