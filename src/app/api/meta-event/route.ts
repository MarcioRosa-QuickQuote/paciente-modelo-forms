import { NextRequest, NextResponse } from 'next/server';
import { getFormById, rowToFormData } from '@/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, eventName = 'Lead', eventSourceUrl, clientUserAgent, eventId, contentName, fbp, fbc } = body;

    // Get real client IP from request headers (Vercel/reverse proxy)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '';

    if (!formId) return NextResponse.json({ error: 'formId obrigatório' }, { status: 400 });

    // Load form and its owner
    const row = await getFormById(formId);
    if (!row) return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });

    const formData = rowToFormData(row);

    // Use per-form pixel/capi
    const pixelId = formData.pixelId;
    const capiToken = formData.capiToken;

    if (!pixelId || !capiToken) return NextResponse.json({ skipped: true });

    // Build Conversions API payload
    const eventTime = Math.floor(Date.now() / 1000);
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId || crypto.randomUUID(),
          action_source: 'website',
          event_source_url: eventSourceUrl || '',
          user_data: {
            client_ip_address: clientIp || '',
            client_user_agent: clientUserAgent || '',
            ...(fbp ? { fbp } : {}),
            ...(fbc ? { fbc } : {}),
          },
          custom_data: {
            content_name: contentName || '',
            content_ids: [formId],
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${capiToken}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Meta CAPI error:', result);
      return NextResponse.json({ error: 'Erro ao enviar para Meta' }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Meta CAPI error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
