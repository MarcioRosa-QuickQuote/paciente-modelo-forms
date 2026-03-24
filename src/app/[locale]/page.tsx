'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import TransitionLink from '@/components/transition-link';

const DEMO_URL = '/formulario/blefaroplastia?demo=true';
const SIGNUP_URL = '/admin/cadastro';

const LANGUAGES = [
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
];

function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    setOpen(false);
    const withoutLocale = pathname.replace(/^\/(en|es)(\/|$)/, '/');
    let newPath: string;
    if (newLocale === 'pt') {
      newPath = withoutLocale || '/';
    } else {
      newPath = `/${newLocale}${withoutLocale === '/' ? '' : withoutLocale}`;
    }
    window.location.href = newPath;
  };

  const current = LANGUAGES.find(l => l.code === currentLocale) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-28 rounded-xl border border-white/10 bg-[#12001e] shadow-xl z-50 overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors ${lang.code === currentLocale ? 'text-violet-400 font-semibold' : 'text-gray-300'}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();

  const features = t.raw('features.items') as Array<{ icon: string; title: string; desc: string }>;
  const niches = t.raw('niches.items') as Array<{ emoji: string; label: string }>;
  const starterFeatures = t.raw('pricing.starter.features') as string[];
  const proFeatures = t.raw('pricing.pro.features') as string[];

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
            <a href="#funcionalidades" className="hover:text-white transition-colors">{t('nav.features')}</a>
            <a href="#nichos" className="hover:text-white transition-colors">{t('nav.niches')}</a>
            <a href="#planos" className="hover:text-white transition-colors">{t('nav.plans')}</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            <TransitionLink href="/admin/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              {t('nav.login')}
            </TransitionLink>
            <TransitionLink href={SIGNUP_URL}
              className="text-sm font-semibold px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 transition-opacity">
              {t('nav.start')}
            </TransitionLink>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <button className="p-2 text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#080010] px-6 py-4 flex flex-col gap-4 text-sm">
            <a href="#funcionalidades" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">{t('nav.features')}</a>
            <a href="#nichos" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">{t('nav.niches')}</a>
            <a href="#planos" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">{t('nav.plans')}</a>
            <TransitionLink href="/admin/login" className="text-gray-400 hover:text-white">{t('nav.login')}</TransitionLink>
            <TransitionLink href={SIGNUP_URL} className="font-semibold text-center py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500">
              {t('nav.start')}
            </TransitionLink>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-24 pb-4 px-6 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Text with staggered animation */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-7"
            >
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              {t('hero.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-5"
            >
              {t('hero.h1a')}{' '}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                {t('hero.h1b')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0"
            >
              {t('hero.p')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3"
            >
              <Link href={DEMO_URL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-base hover:opacity-90 transition-all shadow-xl shadow-violet-500/30 hover:scale-105">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('hero.cta_demo')}
              </Link>
              <TransitionLink href={SIGNUP_URL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-white/10 bg-white/5 font-semibold text-base hover:bg-white/10 transition-all">
                {t('hero.cta_start')}
              </TransitionLink>
            </motion.div>

            <p className="mt-3 text-sm text-gray-500 text-center lg:text-left">{t('hero.fine_print')}</p>
          </div>

          {/* Phone mockup */}
          <div className="flex-shrink-0 relative flex flex-col items-center">
            <div className="absolute -inset-10 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative"
              style={{
                width: 310,
                background: 'linear-gradient(170deg, #3a3a3e 0%, #1e1e22 50%, #111113 100%)',
                borderRadius: 50,
                padding: '9px',
                boxShadow: [
                  '0 0 0 1px #444448',
                  '0 2px 0 1px #555558',
                  '0 60px 80px -10px rgba(0,0,0,0.9)',
                  '0 30px 50px rgba(109,40,217,0.2)',
                  'inset 0 1px 0 rgba(255,255,255,0.12)',
                  'inset 0 -1px 0 rgba(0,0,0,0.5)',
                ].join(', '),
              }}
            >
              {/* Side buttons */}
              <div className="absolute -left-[3px] top-[85px] w-[3px] h-6 rounded-l" style={{ background: 'linear-gradient(to right, #555, #333)' }} />
              <div className="absolute -left-[3px] top-[122px] w-[3px] h-10 rounded-l" style={{ background: 'linear-gradient(to right, #555, #333)' }} />
              <div className="absolute -left-[3px] top-[176px] w-[3px] h-10 rounded-l" style={{ background: 'linear-gradient(to right, #555, #333)' }} />
              <div className="absolute -right-[3px] top-[138px] w-[3px] h-14 rounded-r" style={{ background: 'linear-gradient(to left, #555, #333)' }} />

              {/* Screen */}
              <div style={{ borderRadius: 42, overflow: 'hidden', background: '#000', position: 'relative' }}>
                {/* Dynamic island */}
                <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 96, height: 26, background: '#000', borderRadius: 16, zIndex: 10, boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }} />

                {/* Status bar */}
                <div style={{ height: 46, background: '#fff', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 5px', fontSize: 10, fontWeight: 600, color: '#111', position: 'relative', zIndex: 5 }}>
                  <span>9:41</span>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <svg width="14" height="10" viewBox="0 0 15 11" fill="none"><rect x="0" y="4" width="3" height="7" rx="1" fill="#111"/><rect x="4" y="2.5" width="3" height="8.5" rx="1" fill="#111"/><rect x="8" y="1" width="3" height="10" rx="1" fill="#111"/><rect x="12" y="0" width="3" height="11" rx="1" fill="#111"/></svg>
                    <svg width="15" height="10" viewBox="0 0 16 11" fill="none"><path d="M8 2.2C10.5 2.2 12.7 3.3 14.2 5L15.5 3.6C13.6 1.4 10.9 0 8 0C5.1 0 2.4 1.4 0.5 3.6L1.8 5C3.3 3.3 5.5 2.2 8 2.2Z" fill="#111"/><path d="M8 5.5C9.7 5.5 11.2 6.2 12.3 7.4L13.6 6C12.1 4.4 10.2 3.4 8 3.4C5.8 3.4 3.9 4.4 2.4 6L3.7 7.4C4.8 6.2 6.3 5.5 8 5.5Z" fill="#111"/><circle cx="8" cy="10" r="1.5" fill="#111"/></svg>
                    <svg width="23" height="11" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#111" strokeOpacity="0.35"/><rect x="1.5" y="1.5" width="17" height="9" rx="2.5" fill="#111"/><path d="M23 4V8C23.8 7.7 24.5 7 24.5 6C24.5 5 23.8 4.3 23 4Z" fill="#111" fillOpacity="0.4"/></svg>
                  </div>
                </div>

                {/* iframe */}
                <iframe
                  src="/formulario/blefaroplastia?demo=true"
                  style={{ width: 292, height: 560, border: 'none', display: 'block' }}
                  title="Demo Capta+"
                />

                {/* Home indicator */}
                <div style={{ height: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 88, height: 4, background: '#111', borderRadius: 4, opacity: 0.16 }} />
                </div>
              </div>
            </div>

            {/* Stand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 0 }}>
              <div style={{ width: 28, height: 22, background: 'linear-gradient(to bottom, #2a2a2e, #1a1a1c)', borderRadius: '0 0 4px 4px', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.05)' }} />
              <div style={{ width: 80, height: 10, background: 'linear-gradient(to bottom, #252528, #1a1a1c)', borderRadius: '0 0 6px 6px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }} />
              <div style={{ width: 140, height: 10, marginTop: 2, background: 'linear-gradient(to bottom, #222225, #111113)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.7), 0 2px 0 rgba(255,255,255,0.03)' }} />
            </div>

            {/* Floor shadow */}
            <div style={{ width: 180, height: 14, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)', filter: 'blur(8px)', marginTop: -2 }} />
          </div>

        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '+500', labelKey: 'stats.forms' },
            { value: '+12k', labelKey: 'stats.leads' },
            { value: '+30', labelKey: 'stats.niches' },
            { value: '3 min', labelKey: 'stats.time' },
          ].map((s, i) => (
            <motion.div
              key={s.labelKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-3xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{t(s.labelKey as Parameters<typeof t>[0])}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Demo section ── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">{t('demo.eyebrow')}</p>
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
            {t('demo.h2a')}{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{t('demo.h2b')}</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            {t('demo.p')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={DEMO_URL}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-violet-500/30 hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t('demo.cta_demo')}
            </Link>
            <Link href={SIGNUP_URL} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 font-semibold text-lg hover:bg-white/10 transition-all">
              {t('demo.cta_create')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">{t('features.eyebrow')}</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {t('features.h2a')}<br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{t('features.h2b')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Niches ── */}
      <section id="nichos" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">{t('niches.eyebrow')}</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('niches.h2a')}{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{t('niches.h2b')}</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            {t('niches.p')}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {niches.map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
              >
                <span>{n.emoji}</span>
                {n.label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="planos" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-4">{t('pricing.eyebrow')}</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('pricing.h2')}
          </h2>
          <p className="text-gray-400 text-lg mb-14">{t('pricing.p')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left"
            >
              <p className="text-gray-400 text-sm font-semibold mb-1">{t('pricing.starter.name')}</p>
              <p className="text-4xl font-black mb-1">{t('pricing.starter.price')}<span className="text-xl font-normal text-gray-400">{t('pricing.monthly')}</span></p>
              <p className="text-gray-500 text-sm mb-6">{t('pricing.billed_monthly')}</p>
              <ul className="space-y-3 mb-8">
                {starterFeatures.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <TransitionLink href={SIGNUP_URL}
                className="block text-center py-3 rounded-xl border border-violet-500 text-violet-400 font-semibold hover:bg-violet-500/10 transition-colors">
                {t('pricing.start_free')}
              </TransitionLink>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative bg-gradient-to-b from-violet-600/20 to-pink-600/10 border border-violet-500/50 rounded-2xl p-8 text-left"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-xs font-bold">
                {t('pricing.most_popular')}
              </div>
              <p className="text-violet-300 text-sm font-semibold mb-1">{t('pricing.pro.name')}</p>
              <p className="text-4xl font-black mb-1">{t('pricing.pro.price')}<span className="text-xl font-normal text-gray-400">{t('pricing.monthly')}</span></p>
              <p className="text-gray-500 text-sm mb-6">{t('pricing.billed_monthly')}</p>
              <ul className="space-y-3 mb-8">
                {proFeatures.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <TransitionLink href={SIGNUP_URL}
                className="block text-center py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/30">
                {t('pricing.start_free')}
              </TransitionLink>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-black mb-6"
            >
              {t('cta.h2a')}<br />
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{t('cta.h2b')}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-400 text-lg mb-10"
            >
              {t('cta.p')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <TransitionLink href={SIGNUP_URL}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xl hover:opacity-90 transition-all shadow-xl shadow-violet-500/30 hover:scale-105">
                {t('cta.start')}
              </TransitionLink>
              <Link href={DEMO_URL}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 font-semibold hover:bg-white/5 transition-all">
                {t('cta.demo')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Image src="/capta.png" alt="Capta+" width={24} height={24} className="rounded-md opacity-70" />
            <span>© {new Date().getFullYear()} Capta+. {t('footer.rights')}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</Link>
            <Link href="/termos" className="hover:text-gray-300 transition-colors">{t('footer.terms')}</Link>
            <TransitionLink href="/admin/login" className="hover:text-gray-300 transition-colors">{t('footer.login')}</TransitionLink>
            <TransitionLink href={SIGNUP_URL} className="hover:text-gray-300 transition-colors">{t('footer.register')}</TransitionLink>
          </div>
        </div>
      </footer>

    </div>
  );
}
