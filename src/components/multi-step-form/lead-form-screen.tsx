'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { FormFields } from '@/types/form';
import { Theme } from '@/lib/themes';

interface Props {
  formId: string;
  formFields: FormFields;
  theme: Theme;
  onTrackEvent?: (eventName: string) => void;
}

const BALLOONS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FB7185', '#34D399', '#60A5FA', '#F472B6'];

export default function LeadFormScreen({ formId, formFields, theme, onTrackEvent }: Props) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const hasLaunched = useRef(false);

  const launchConfetti = useCallback(() => {
    const colors = [theme.gradientFrom, theme.gradientTo, '#10b981', '#f59e0b', '#3b82f6'];
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.8 }, colors });
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.8 }, colors });
    setTimeout(() => {
      confetti({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.6 }, colors });
    }, 500);
  }, [theme]);

  useEffect(() => {
    if (!hasLaunched.current) {
      hasLaunched.current = true;
      launchConfetti();
    }
  }, [launchConfetti]);

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, name, whatsapp: whatsapp.replace(/\D/g, ''), email }),
      });

      if (res.ok) {
        fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId, step: 5, answer: 'sim' }),
        }).catch(() => {});

        onTrackEvent?.('CompleteRegistration');
        setSent(true);
        launchConfetti();
      } else {
        alert('Erro ao enviar dados. Tente novamente.');
      }
    } catch {
      alert('Erro ao enviar dados. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8 overflow-hidden">
        {BALLOONS.map((color, i) => (
          <div key={i} className="balloon absolute text-4xl" style={{ left: `${10 + (i * 11)}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${3 + Math.random() * 2}s`, bottom: '-10%' }}>
            <svg width="40" height="50" viewBox="0 0 40 50">
              <ellipse cx="20" cy="18" rx="16" ry="18" fill={color} opacity="0.85" />
              <path d="M20 36 L18 50 M20 36 L22 50" stroke={color} strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
        ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
        >
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center z-10"
        >
          <h1 className="text-3xl font-extrabold mb-3">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
            >
              Dados enviados!
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Uma das nossas consultoras entrará em contato em breve 🥰
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8 overflow-hidden">
      {BALLOONS.map((color, i) => (
        <div key={i} className="balloon absolute text-4xl" style={{ left: `${10 + (i * 11)}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${3 + Math.random() * 2}s`, bottom: '-10%' }}>
          <svg width="40" height="50" viewBox="0 0 40 50">
            <ellipse cx="20" cy="18" rx="16" ry="18" fill={color} opacity="0.85" />
            <path d="M20 36 L18 50 M20 36 L22 50" stroke={color} strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
        className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-500/30"
      >
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center mb-6 z-10"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
          >
            Parabéns!
          </span>
        </h1>
        <p className="text-lg text-gray-700 font-semibold mb-1">
          Você foi qualificada para ser nossa paciente modelo!
        </p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Preencha o formulário abaixo com seus dados que nossos consultores entrarão em contato
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="z-10 w-full max-w-sm space-y-4"
      >
        {formFields.name && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome completo"
              style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 bg-white/90 backdrop-blur-sm"
              required
            />
          </div>
        )}

        {formFields.whatsapp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="text"
              inputMode="numeric"
              value={whatsapp}
              onChange={e => setWhatsapp(formatPhone(e.target.value))}
              placeholder="(91) 9 8382-8928"
              style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 bg-white/90 backdrop-blur-sm"
              required
            />
          </div>
        )}

        {formFields.email && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-gray-900 bg-white/90 backdrop-blur-sm"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          style={{ background: theme.yesBtn }}
          className="w-full py-4 text-white font-bold text-lg rounded-2xl shadow-xl transition-all disabled:opacity-50"
        >
          {sending ? 'Enviando...' : 'Enviar meus dados'}
        </button>
      </motion.form>
    </div>
  );
}
