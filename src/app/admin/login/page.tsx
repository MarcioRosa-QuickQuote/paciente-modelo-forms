'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, ALLOWED_EMAILS } from '@/lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!ALLOWED_EMAILS.includes(email.toLowerCase().trim())) {
      setError('Este e-mail não tem permissão de acesso.');
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Confirme seu e-mail antes de fazer login.');
        } else {
          setError(authError.message);
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={72}
            height={72}
            className="rounded-2xl shadow-lg shadow-[#6B1C3A]/20 mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Paciente Modelo</h1>
          <p className="text-gray-400 text-sm mt-1">Painel de Gerenciamento</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Entrar na sua conta</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-6 py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Activate link */}
        <div className="text-center mt-6">
          <Link
            href="/admin/ativar"
            className="text-[#6B1C3A] hover:text-[#9B2D5E] text-sm font-medium transition-colors"
          >
            Primeiro acesso? Ative sua conta
          </Link>
        </div>
      </div>
    </div>
  );
}
