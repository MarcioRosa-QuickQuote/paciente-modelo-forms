'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

const PUBLIC_PATHS = ['/admin/login', '/admin/ativar', '/admin/cadastro', '/admin/subscribe', '/admin/subscribe/success'];
const ALLOWED_EMAILS = ['jhqbomfim@gmail.com', 'marciolarosa@gmail.com'];

function SubscriptionModal({ user, onClose, onSubscribe, onPortal }: {
  user: User;
  onClose: () => void;
  onSubscribe: () => void;
  onPortal: () => void;
}) {
  const subscriptionStatus = user.user_metadata?.subscription_status as string | undefined;
  const trialEndsAt = user.user_metadata?.trial_ends_at as number | undefined;
  const isActive = subscriptionStatus === 'active';

  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  const trialExpired = trialEndsAt ? trialEndsAt < Date.now() : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Minha Assinatura</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status */}
        {isActive ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Assinatura ativa</p>
              <p className="text-emerald-600 text-xs">Acesso completo ao Capta+</p>
            </div>
          </div>
        ) : trialExpired ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-800 text-sm">Período de teste expirado</p>
              <p className="text-red-600 text-xs">Assine para continuar usando</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {daysLeft}d
              </div>
              <div>
                <p className="font-semibold text-amber-800 text-sm">Período de teste gratuito</p>
                <p className="text-amber-600 text-xs">{daysLeft === 0 ? 'Expira hoje' : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}</p>
              </div>
            </div>
            <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.max(5, (daysLeft / 7) * 100)}%` }} />
            </div>
          </div>
        )}

        {/* Plano */}
        <div className="border border-gray-100 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-[#6B1C3A] uppercase tracking-wide">Plano Profissional</p>
            {isActive && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Ativo</span>}
          </div>
          <p className="text-2xl font-black text-gray-900">R$ 97<span className="text-sm font-normal text-gray-400">/mês</span></p>
          <ul className="mt-3 space-y-1">
            {['Formulários ilimitados', 'Leads organizados', 'Meta Pixel + CAPI', 'Temas personalizáveis'].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-[#6B1C3A] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        {isActive ? (
          <button onClick={onPortal}
            className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm cursor-pointer">
            Gerenciar pagamento no Stripe
          </button>
        ) : (
          <button onClick={onSubscribe}
            className="w-full py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-bold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 cursor-pointer">
            Assinar agora — R$ 97/mês
          </button>
        )}

        <p className="text-xs text-gray-400 text-center mt-3">Pagamento seguro via Stripe · Cancele quando quiser</p>
      </div>
    </div>
  );
}

function UserMenu({ user, isOwner, onLogout, onSubscription }: {
  user: User;
  isOwner: boolean;
  onLogout: () => void;
  onSubscription: () => void;
}) {
  const [open, setOpen] = useState(false);
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initials = (user.email ?? '?')[0].toUpperCase();

  const subscriptionStatus = user.user_metadata?.subscription_status as string | undefined;
  const trialEndsAt = user.user_metadata?.trial_ends_at as number | undefined;

  function getStatusLabel() {
    if (isOwner) return null;
    if (subscriptionStatus === 'active') return { label: 'Assinante ativo', color: 'text-emerald-600 bg-emerald-50' };
    if (trialEndsAt && trialEndsAt > Date.now()) {
      const daysLeft = Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24));
      return { label: `Trial: ${daysLeft}d restante${daysLeft !== 1 ? 's' : ''}`, color: 'text-amber-600 bg-amber-50' };
    }
    return { label: 'Trial expirado', color: 'text-red-600 bg-red-50' };
  }

  const status = getStatusLabel();

  return (
    <div className="relative ml-1">
      <button onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#6B1C3A]/40 transition-all flex items-center justify-center cursor-pointer">
        {avatarUrl
          ? <Image src={avatarUrl} alt="avatar" width={36} height={36} className="object-cover w-full h-full" />
          : <span className="bg-gradient-to-br from-[#6B1C3A] to-[#9B2D5E] text-white text-sm font-bold w-full h-full flex items-center justify-center">{initials}</span>
        }
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl py-2">

            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {status && (
                <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              )}
            </div>

            {/* Configurações */}
            <Link href="/admin/settings" onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </Link>

            {/* Assinatura — só para não-owners */}
            {!isOwner && (
              <button onClick={() => { setOpen(false); onSubscription(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Minha Assinatura
              </button>
            )}

            <div className="border-t border-gray-100 mt-1" />

            {/* Logout */}
            <button onClick={() => { setOpen(false); onLogout(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/admin/login');
      return;
    }
    if (user && !PUBLIC_PATHS.includes(pathname)) {
      const isOwner = ALLOWED_EMAILS.includes(user.email ?? '');
      const isSubscribed = user.user_metadata?.subscription_status === 'active';
      if (!isOwner && !isSubscribed) {
        const trialEndsAt = user.user_metadata?.trial_ends_at as number | undefined;
        const now = Date.now();
        if (!trialEndsAt) {
          const trialEnd = now + 7 * 24 * 60 * 60 * 1000;
          supabase.auth.updateUser({ data: { trial_ends_at: trialEnd } });
        } else if (trialEndsAt < now) {
          router.push('/admin/subscribe?expired=true');
        }
      }
    }
  }, [loading, user, pathname, router]);

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6B1C3A]/20 border-t-[#6B1C3A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isOwner = ALLOWED_EMAILS.includes(user?.email ?? '');

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  async function handlePortal() {
    if (!user?.email) return;
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: user.email }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin">
              <Image src="/capta.png" alt="Logo" width={80} height={32} className="object-contain" />
            </Link>
            {process.env.NEXT_PUBLIC_LAST_COMMIT && (
              <span className="hidden md:block text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-lg font-mono">
                {(() => {
                  const d = new Date(process.env.NEXT_PUBLIC_LAST_COMMIT!);
                  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                })()}
              </span>
            )}
            <nav className="flex items-center gap-2">
              <Link href="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin' ? 'bg-[#6B1C3A]/10 text-[#6B1C3A] shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                Dashboard
              </Link>
              <Link href="/admin/leads"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin/leads' ? 'bg-[#6B1C3A]/10 text-[#6B1C3A] shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                Leads
              </Link>
              <Link href="/admin/forms/new"
                className="px-5 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl text-sm font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20">
                + Novo Formulário
              </Link>
              <UserMenu user={user} isOwner={isOwner} onLogout={handleLogout} onSubscription={() => setSubscriptionOpen(true)} />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>

      {subscriptionOpen && (
        <SubscriptionModal
          user={user}
          onClose={() => setSubscriptionOpen(false)}
          onSubscribe={async () => {
            if (!user) return;
            const res = await fetch('/api/stripe/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, userEmail: user.email }),
            });
            const { url } = await res.json();
            if (url) window.location.href = url;
          }}
          onPortal={handlePortal}
        />
      )}
    </div>
  );
}
