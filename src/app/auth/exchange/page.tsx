'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

function Exchange() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) { router.replace('/admin/login'); return; }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error('[auth/exchange] error:', error.message);
        router.replace(`/admin/login?auth_error=${encodeURIComponent(error.message)}`);
      } else {
        router.replace('/admin');
      }
    });
  }, [router, searchParams]);

  return null;
}

export default function AuthExchangePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Entrando...</p>
      </div>
      <Suspense>
        <Exchange />
      </Suspense>
    </div>
  );
}
