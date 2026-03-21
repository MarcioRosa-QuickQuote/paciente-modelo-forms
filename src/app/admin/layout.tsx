'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

const PUBLIC_PATHS = ['/admin/login', '/admin/ativar', '/admin/cadastro', '/admin/subscribe', '/admin/subscribe/success'];
const ALLOWED_EMAILS = ['jhqbomfim@gmail.com', 'marciolarosa@gmail.com'];

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initials = (user.email ?? '?')[0].toUpperCase();

  return (
    <div className="relative ml-1">
      <button onClick={() => setOpen(o => !o)} className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#6B1C3A]/40 transition-all flex items-center justify-center cursor-pointer">
        {avatarUrl
          ? <Image src={avatarUrl} alt="avatar" width={36} height={36} className="object-cover w-full h-full" />
          : <span className="bg-gradient-to-br from-[#6B1C3A] to-[#9B2D5E] text-white text-sm font-bold w-full h-full flex items-center justify-center">{initials}</span>
        }
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button onClick={() => { setOpen(false); onLogout(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer">
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
          // Primeiro acesso: inicia trial de 3 dias
          const trialEnd = now + 3 * 24 * 60 * 60 * 1000;
          supabase.auth.updateUser({ data: { trial_ends_at: trialEnd } });
          // Permite acesso enquanto o update acontece
        } else if (trialEndsAt < now) {
          // Trial expirado
          router.push('/admin/subscribe?expired=true');
        }
        // Se trial ainda válido: permite acesso normalmente
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
      {/* Header */}
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
              <Link href="/admin/settings"
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  pathname === '/admin/settings' ? 'bg-[#6B1C3A]/10 text-[#6B1C3A]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Configurações">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              {!isOwner && (
                <button onClick={handlePortal} title="Minha Assinatura"
                  className="px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                  Assinatura
                </button>
              )}
              <Link href="/admin/forms/new"
                className="px-5 py-2.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl text-sm font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20">
                + Novo Formulário
              </Link>
              <UserMenu user={user} onLogout={handleLogout} />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
