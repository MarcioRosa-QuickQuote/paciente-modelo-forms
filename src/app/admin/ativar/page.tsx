'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, ALLOWED_EMAILS } from '@/lib/supabase-client';

export default function ActivatePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!ALLOWED_EMAILS.includes(email.toLowerCase().trim())) {
      setError('Este e-mail não tem permissão de acesso.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este e-mail já possui uma conta. Faça login.');
        } else {
          setError(authError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError('Erro ao ativar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta ativada!</h2>
          <p className="text-gray-500 mb-2">Verifique seu e-mail para confirmar a conta.</p>
          <p className="text-gray-400 text-sm mb-8">Caso não precise de confirmação, já pode fazer login.</p>
          <Link
            href="/admin/login"
            className="inline-flex px-8 py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Ativar Conta</h1>
          <p className="text-gray-400 text-sm mt-1">Crie sua senha para acessar o painel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleActivate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
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
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B1C3A] focus:border-transparent outline-none transition-all text-gray-900"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-6 py-3.5 bg-gradient-to-r from-[#6B1C3A] to-[#9B2D5E] text-white rounded-xl font-semibold hover:from-[#5A1731] hover:to-[#8A2653] transition-all shadow-lg shadow-[#6B1C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ativando...' : 'Ativar Conta'}
          </button>
        </form>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link
            href="/admin/login"
            className="text-[#6B1C3A] hover:text-[#9B2D5E] text-sm font-medium transition-colors"
          >
            Já tem conta? Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
