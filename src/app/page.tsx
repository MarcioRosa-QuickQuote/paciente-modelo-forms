'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const DEMO_URL = '/formulario/blefaroplastia?demo=true';
const SIGNUP_URL = '/admin/cadastro';

const FEATURES = [
  {
    icon: '📸',
    title: 'Fotos Antes e Depois',
    desc: 'Mostre resultados reais que convencem. Carrossel automático com múltiplos casos.',
  },
  {
    icon: '🎯',
    title: 'Perguntas de Qualificação',
    desc: 'Filtre leads não qualificados antes de chegar até você. Só quem vale o seu tempo passa.',
  },
  {
    icon: '💰',
    title: 'Taxa de Reserva',
    desc: 'Leads que pagam uma taxa simbólica são sérios. Reduza no-shows e aumente compromisso.',
  },
  {
    icon: '📱',
    title: 'WhatsApp Automático',
    desc: 'Lead qualificado? Cai direto no seu WhatsApp com a mensagem certa, pronto para fechar.',
  },
  {
    icon: '🎨',
    title: 'Totalmente Personalizável',
    desc: 'Cores, textos, fotos e perguntas. Seu funil com a sua identidade visual.',
  },
  {
    icon: '⚡',
    title: 'Pronto em Minutos',
    desc: 'Escolha um template do seu nicho, ajuste e publique. Sem precisar de programador.',
  },
];

const NICHES = [
  { emoji: '✨', label: 'Clínicas Estéticas' },
  { emoji: '🦷', label: 'Dentistas' },
  { emoji: '💪', label: 'Personal Trainers' },
  { emoji: '🏠', label: 'Imobiliárias' },
  { emoji: '🧠', label: 'Coaches & Mentores' },
  { emoji: '💇', label: 'Salões de Beleza' },
  { emoji: '🥗', label: 'Nutricionistas' },
  { emoji: '⚖️', label: 'Advogados' },
  { emoji: '📊', label: 'Consultores' },
  { emoji: '🏋️', label: 'Academias' },
  { emoji: '👁️', label: 'Oftalmologistas' },
  { emoji: '🐾', label: 'Veterinários' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-[#080010] text-white min-h-screen overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080010]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/capta.png" alt="Capta+" width={36} height={36} className="rounded-lg" />
            <span className="font-bold text-lg">Capta<span className="text-pink-400">+</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#nichos" className="hover:text-white transition-colors">Nichos</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Entrar
            </Link>
            <Link href={SIGNUP_URL}
              className="text-sm font-semibold px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 transition-opacity">
              Começar grátis
            </Link>
          </div>

          <button className="md:hidden p-2 text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#080010] px-6 py-4 flex flex-col gap-4 text-sm">
            <a href="#funcionalidades" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">Funcionalidades</a>
            <a href="#nichos" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">Nichos</a>
            <a href="#planos" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">Planos</a>
            <Link href="/admin/login" className="text-gray-400 hover:text-white">Entrar</Link>
            <Link href={SIGNUP_URL} className="font-semibold text-center py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500">
              Começar grátis
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-20 px-6 text-center relative">
        {/* Glow background */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Funis interativos para qualquer nicho
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6">
            Seus leads chegam{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              prontos para fechar
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Crie funis interativos com fotos, qualificação automática e taxa de reserva.
            Funciona para clínicas, treinadores, consultores e muito mais.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={DEMO_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver demonstração ao vivo
            </Link>
            <Link href={SIGNUP_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 font-semibold text-lg hover:bg-white/10 transition-all">
              Começar grátis — 3 dias
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '+500', label: 'Formulários criados' },
            { value: '+12k', label: 'Leads gerados' },
            { value: '+30', label: 'Nichos atendidos' },
            { value: '3 min', label: 'Para publicar' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo section ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">Veja ao vivo</p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              Experimente um funil<br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">completo agora</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Clique no botão e viva a experiência que seus leads terão. Fotos, perguntas de qualificação, preço e taxa de reserva — tudo em um fluxo fluido no celular.
            </p>
            <ul className="space-y-3 mb-10">
              {['Fotos antes e depois que convencem', 'Qualificação automática de leads', 'Taxa de reserva que aumenta compromisso', 'WhatsApp pronto para fechar'].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href={DEMO_URL}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-violet-500/30 hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Abrir formulário demo
            </Link>
          </div>

          {/* Phone mockup */}
          <div className="order-1 lg:order-2 flex-shrink-0 relative">
            <div className="absolute inset-0 bg-violet-600/30 rounded-full blur-[80px]" />
            <div className="relative w-[280px] bg-gray-900 rounded-[40px] border-4 border-gray-700 shadow-2xl overflow-hidden">
              <div className="h-6 bg-gray-900 flex items-center justify-center">
                <div className="w-20 h-1.5 bg-gray-700 rounded-full" />
              </div>
              <div className="bg-white h-[500px] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 text-sm mb-2">Toque para ver o demo</p>
                <p className="text-gray-400 text-xs mb-6">Funil completo de qualificação</p>
                <Link href={DEMO_URL}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                  Abrir demo →
                </Link>
              </div>
              <div className="h-4 bg-gray-900" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">Funcionalidades</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tudo que você precisa para<br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">qualificar leads de verdade</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Niches ── */}
      <section id="nichos" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">Nichos</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Funciona para o seu{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">segmento</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Templates prontos para dezenas de nichos. Escolha, personalize e publique em minutos.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {NICHES.map(n => (
              <div key={n.label}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                <span>{n.emoji}</span>
                {n.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="planos" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">Planos</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Simples e sem surpresas
          </h2>
          <p className="text-gray-400 text-lg mb-14">3 dias grátis para testar. Cancele quando quiser.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
              <p className="text-gray-400 text-sm font-semibold mb-1">Starter</p>
              <p className="text-4xl font-black mb-1">R$97<span className="text-xl font-normal text-gray-400">/mês</span></p>
              <p className="text-gray-500 text-sm mb-6">Cobrado mensalmente</p>
              <ul className="space-y-3 mb-8">
                {['Até 5 formulários', 'Leads ilimitados', 'Fotos antes e depois', 'Perguntas personalizadas', 'Link de compartilhamento', 'Suporte por e-mail'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={SIGNUP_URL}
                className="block text-center py-3 rounded-xl border border-violet-500 text-violet-400 font-semibold hover:bg-violet-500/10 transition-colors">
                Começar grátis
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-gradient-to-b from-violet-600/20 to-pink-600/10 border border-violet-500/50 rounded-2xl p-8 text-left">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-xs font-bold">
                MAIS POPULAR
              </div>
              <p className="text-violet-300 text-sm font-semibold mb-1">Pro</p>
              <p className="text-4xl font-black mb-1">R$197<span className="text-xl font-normal text-gray-400">/mês</span></p>
              <p className="text-gray-500 text-sm mb-6">Cobrado mensalmente</p>
              <ul className="space-y-3 mb-8">
                {['Formulários ilimitados', 'Leads ilimitados', 'Todos os recursos do Starter', 'Taxa de reserva integrada', 'Pixel do Facebook', 'Múltiplos usuários', 'Suporte prioritário no WhatsApp'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={SIGNUP_URL}
                className="block text-center py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/30">
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Pronto para receber leads<br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">que realmente fecham?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Crie seu primeiro funil em menos de 3 minutos. Grátis por 3 dias.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={SIGNUP_URL}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xl hover:opacity-90 transition-all shadow-xl shadow-violet-500/30 hover:scale-105">
                Experimentar grátis por 3 dias
              </Link>
              <Link href={DEMO_URL}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 font-semibold hover:bg-white/5 transition-all">
                Ver demo primeiro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Image src="/capta.png" alt="Capta+" width={24} height={24} className="rounded-md opacity-70" />
            <span>© {new Date().getFullYear()} Capta+. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="hover:text-gray-300 transition-colors">Entrar</Link>
            <Link href={SIGNUP_URL} className="hover:text-gray-300 transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
