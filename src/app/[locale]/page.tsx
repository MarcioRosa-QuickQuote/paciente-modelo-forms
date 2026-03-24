'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import TransitionLink from '@/components/transition-link';

const DEMO_URL = '/formulario/blefaroplastia?demo=true';
const SIGNUP_URL = '/admin/login';

const LANGUAGES = [
  { code: 'pt', label: 'Português', flagSrc: 'https://flagcdn.com/w40/br.png' },
  { code: 'en', label: 'English',   flagSrc: 'https://flagcdn.com/w40/us.png' },
  { code: 'es', label: 'Español',   flagSrc: 'https://flagcdn.com/w40/es.png' },
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.flagSrc} alt={current.label} className="w-5 h-3.5 object-cover rounded-sm" />
        <span className="text-gray-200">{current.label}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-white/10 bg-[#12001e] shadow-xl z-50 overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/10 transition-colors ${lang.code === currentLocale ? 'text-violet-400 font-semibold bg-white/5' : 'text-gray-300'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lang.flagSrc} alt={lang.label} className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />
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
            <Image src="/capta.png" alt="Capta+" width={48} height={48} className="rounded-lg" />
            <span className="font-bold text-xl">Capta<span className="text-pink-400">+</span></span>
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
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-20 pb-16 px-6 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Texto (esquerda) ── */}
          <div className="flex-1 flex flex-col items-start text-left">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-7"
            >
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              {t('hero.badge')}
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-5"
            >
              {t('hero.h1a')}{' '}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                {t('hero.h1b')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400 mb-8 leading-relaxed whitespace-pre-line"
            >
              {t('hero.p')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-3 mb-3 w-full"
            >
              <TransitionLink href={SIGNUP_URL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-base hover:opacity-90 transition-all shadow-xl shadow-violet-500/30 hover:scale-105">
                {t('hero.cta_start')}
              </TransitionLink>
              <Link href={DEMO_URL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-white/10 bg-white/5 font-semibold text-base hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('hero.cta_demo')}
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-500"
            >
              {t('hero.fine_print')}
            </motion.p>
          </div>

          {/* ── VSL Vertical (direita) ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-shrink-0 flex flex-col items-center"
          >
            {/* Glow atrás do player */}
            <div className="absolute w-72 h-72 bg-violet-500/20 blur-[80px] rounded-full pointer-events-none" />

            {/* Container do vídeo vertical 9:16 */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/50"
              style={{
                width: 280,
                height: 498,
                border: '1px solid rgba(139,92,246,0.3)',
                background: '#0d0d14',
              }}
            >
              {/* Troque VIDEO_ID pelo ID do seu vídeo no Pandavideo */}
              <iframe
                src="https://player.pandavideo.com.br/embed/?v=VIDEO_ID"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                title="Capta+ VSL"
              />
            </div>

            {/* Label abaixo do vídeo */}
            <p className="mt-4 text-xs text-gray-500 text-center max-w-[220px]">
              Veja como funciona em 2 minutos
            </p>
          </motion.div>

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

      {/* ── Pain section ── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-6"
          >
            Você profissional da saúde
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black mb-6 leading-tight"
          >
            Investe em anúncios e{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">não vê resultado?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg leading-relaxed mb-8"
          >
            É porque você não está usando o funil da maneira correta. Desenvolvemos um funil diferente de qualquer outro — que leva o paciente até você com <strong className="text-white">previsibilidade</strong>, qualifica automaticamente cada lead e transforma em paciente pronto para fazer o procedimento.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: '😰', text: 'Investe em anúncios e agenda vazia' },
              { icon: '📉', text: 'Leads que somem ou não aparecem' },
              { icon: '😤', text: 'Pacientes sem compromisso e faltas' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-3xl">{item.icon}</span>
                <p className="text-gray-400 text-sm text-center">{item.text}</p>
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-violet-300 font-semibold text-lg"
          >
            ↓ A Capta+ resolve tudo isso ↓
          </motion.div>
        </div>
      </section>


      {/* ── Features ── */}
      <section id="funcionalidades" className="py-24 px-6 [scroll-margin-top:-80px]">
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
      <section id="nichos" className="py-24 px-6 border-t border-white/5 scroll-mt-4">
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
      <section id="planos" className="py-24 px-6 border-t border-white/5 [scroll-margin-top:-90px]">
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
