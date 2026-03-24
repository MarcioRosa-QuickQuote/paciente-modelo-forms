'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase detecta automaticamente o `code` na URL (detectSessionInUrl: true)
    // e troca pelo session via PKCE. Só precisamos escutar o evento.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/admin');
      }
    });

    // Fallback: se não autenticar em 10s, volta pro login
    const timeout = setTimeout(() => {
      router.replace('/admin/login?auth_error=Tempo+esgotado.+Tente+novamente.');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080010] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Entrando...</p>
      </div>
    </div>
  );
}
