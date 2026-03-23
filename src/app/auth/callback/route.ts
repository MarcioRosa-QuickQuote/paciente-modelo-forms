import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rota de callback OAuth — redireciona para a página que troca o code no browser
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Passa o code para a página client-side que finaliza o login
  const next = `/auth/exchange?code=${code}`;
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
