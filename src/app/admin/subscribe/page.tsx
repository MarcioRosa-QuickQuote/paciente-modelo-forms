'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === 'true';
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/admin/login');
      } else {
        setUser(data.user);
      }
    });
  }, [router]);

  async function handleSubscribe() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      });
      const { url, error } = await res.json();
      if (error) { alert(error); return; }
      window.location.href = url;
    } catch {
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <Image src="/capta.png" alt="Logo" width={80} height={32} className="object-contain mb-4" />
        </div>

        {/* Banner de trial expirado */}
        {expired && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <p className="text-amber-800 font-semibold text-sm">Seu período de teste gratuito expirou</p>
            <p className="text-amber-600 text-xs mt-1">Assine para continuar usando o Capta+ sem interrupções.</p>
          </div>
        )}

        {!expired && (
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Comece grátis por 7 dias</h1>
            <p className="text-gray-400 text-sm mt-1">Sem cobrança agora — cancele a qualquer momento</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Plano */}
          <div className="rounded-2xl border-2 border-[#6B1C3A] bg-[#6B1C3A]/5 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-[#6B1C3A] uppercase tracking-wide mb-1">Plano Profissional</p>
                <p className="text-3xl font-black text-gray-900">R$ 97<span className="text-base font-normal text-gray-400">/mês após 7 dias</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B1C3A] to-[#9B2D5E] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                'Formulários ilimitados',
                'Preview em tempo real',
                'Integração com Meta Pixel e CAPI',
                'Leads organizados no painel',
                'Temas e textos personalizáveis',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-[#6B1C3A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-bold text-lg hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecionando...
              </span>
            ) : 'Começar teste grátis — 7 dias'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Cartão necessário · Sem cobrança nos primeiros 7 dias · Cancele quando quiser
          </p>
        </div>

        {user && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Conectado como <span className="font-medium text-gray-600">{user.email}</span>
            {' · '}
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors cursor-pointer">
              Sair
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  );
}
