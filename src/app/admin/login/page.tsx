'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';

const TYPEWRITER_TEXT = 'Funil Inteligente de Conversão';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!logoReady) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(TYPEWRITER_TEXT.slice(0, i));
      if (i === TYPEWRITER_TEXT.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, [logoReady]);

  function switchTab(t: 'login' | 'signup') {
    setTab(t);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleGoogle() {
    setLoadingGoogle(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
    } catch {
      setError('Erro ao continuar com Google.');
    } finally {
      setLoadingGoogle(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) setError('E-mail ou senha incorretos.');
        else if (authError.message.includes('Email not confirmed')) setError('Confirme seu e-mail antes de fazer login.');
        else setError(authError.message);
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (authError) {
        if (authError.message.includes('already registered')) setError('Este e-mail já possui uma conta. Faça login.');
        else setError(authError.message);
        return;
      }
      setSignupSuccess(true);
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta criada!</h2>
          <p className="text-gray-500 mb-2">Verifique seu e-mail para confirmar o cadastro.</p>
          <p className="text-gray-400 text-sm mb-8">Após confirmar, faça login para ativar seu período de teste gratuito.</p>
          <button onClick={() => { setSignupSuccess(false); switchTab('login'); }}
            className="inline-flex px-8 py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 cursor-pointer">
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideFromRight {
          from { transform: translateX(72px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .logo-slide {
          animation: slideFromRight 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .typewriter-cursor::after {
          content: '|';
          animation: blink 0.8s step-end infinite;
          margin-left: 1px;
          color: #6B1C3A;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center px-4">
        <div className="w-full max-w-md">

          {/* Brand header */}
          <div className="mb-5 pl-1 logo-slide" onAnimationEnd={() => setLogoReady(true)}>
            <div className="flex items-center gap-3">
              <Image src="/capta.png" alt="Logo" width={48} height={48} className="object-contain rounded-xl flex-shrink-0" />
              <p className={`text-2xl font-bold leading-tight ${logoReady && typedText.length < TYPEWRITER_TEXT.length ? 'typewriter-cursor' : ''}`}
                style={{ background: 'linear-gradient(135deg, #6B1C3A 0%, #9B2D5E 60%, #C44B82 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {typedText || '\u00A0'}
              </p>
            </div>
          </div>

          {/* Modal */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button onClick={() => switchTab('login')}
                className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${tab === 'login' ? 'text-[#6B1C3A] border-b-2 border-[#6B1C3A] bg-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}>
                Entrar
              </button>
              <button onClick={() => switchTab('signup')}
                className={`flex-1 py-4 text-sm font-semibold transition-all cursor-pointer ${tab === 'signup' ? 'text-[#6B1C3A] border-b-2 border-[#6B1C3A] bg-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}>
                Criar conta
              </button>
            </div>

            <div className="p-8">
              {tab === 'signup' && (
                <p className="text-center text-sm text-emerald-600 font-medium bg-emerald-50 rounded-xl py-2 px-3 mb-5">
                  3 dias grátis — sem precisar de cartão
                </p>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button type="button" onClick={handleGoogle} disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-5">
                {loadingGoogle
                  ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  : <GoogleIcon />}
                {tab === 'login' ? 'Entrar com Google' : 'Continuar com Google'}
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900" required />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              )}

              {tab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900" required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar senha</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a senha"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900" required minLength={6} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    {loading ? 'Criando conta...' : 'Criar conta grátis'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="text-center mt-5 flex flex-col items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para Página Capta+
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/privacidade" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Privacidade</Link>
              <span className="text-gray-200">·</span>
              <Link href="/termos" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Termos</Link>
            </div>
            <Link href="/admin/ativar" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">
              Ativar conta de owner
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
