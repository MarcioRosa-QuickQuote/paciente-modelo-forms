import { NextRequest, NextResponse } from 'next/server';
import { getDirectGoogleMapEmbedUrl } from '@/lib/google-maps';

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url')?.trim() || '';
  if (!rawUrl) {
    return NextResponse.json({ error: 'URL obrigatoria' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(rawUrl);
    if (!/^https?:$/i.test(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store',
    });

    const finalUrl = response.url || parsedUrl.toString();
    const embedUrl = getDirectGoogleMapEmbedUrl(undefined, finalUrl);

    if (!embedUrl) {
      return NextResponse.json({ error: 'Nao foi possivel converter o link do mapa' }, { status: 422 });
    }

    return NextResponse.json({ embedUrl, finalUrl });
  } catch {
    return NextResponse.json({ error: 'Nao foi possivel resolver o link do mapa' }, { status: 500 });
  }
}
