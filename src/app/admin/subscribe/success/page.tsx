'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'activating' | 'done' | 'error'>('activating');

  useEffect(() => {
    if (!sessionId) {
      router.push('/admin');
      return;
    }

    fetch('/api/stripe/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(async (data) => {
        if (data.ok) {
          // Force JWT refresh so layout reads updated subscription_status
          await supabase.auth.refreshSession();
          setStatus('done');
          setTimeout(() => router.push('/admin'), 2000);
        } else {
          await supabase.auth.refreshSession();
          setStatus('error');
          setTimeout(() => router.push('/admin'), 3000);
        }
      })
      .catch(async () => {
        await supabase.auth.refreshSession();
        setStatus('error');
        setTimeout(() => router.push('/admin'), 3000);
      });
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Image src="/capta.png" alt="Logo" width={80} height={32} className="object-contain mx-auto mb-6" />

        {status === 'activating' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
            </div>
            <p className="text-gray-500">Ativando seu acesso...</p>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Teste grátis iniciado!</h1>
            <p className="text-gray-500 mb-2">Seus 7 dias começaram agora.</p>
            <p className="text-gray-400 text-sm mb-6">Nenhum valor será cobrado até o fim do período de teste.</p>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento confirmado!</h1>
            <p className="text-gray-500 mb-6">Redirecionando para o painel...</p>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
