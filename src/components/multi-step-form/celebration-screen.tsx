'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { Theme } from '@/lib/themes';
import { CustomTexts } from '@/types/form';

interface Props {
  formId: string;
  whatsappNumber: string;
  procedureName: string;
  whatsappMessage?: string;
  theme: Theme;
  onTrackEvent?: (eventName: string) => void;
  customTexts?: CustomTexts;
  demo?: boolean;
}

const BALLOONS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FB7185', '#34D399', '#60A5FA', '#F472B6'];

export default function CelebrationScreen({ formId, whatsappNumber, procedureName, whatsappMessage, theme, onTrackEvent, customTexts, demo }: Props) {
  const hasLaunched = useRef(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const launchConfetti = useCallback(() => {
    const colors = [theme.gradientFrom, theme.gradientTo, '#10b981', '#f59e0b', '#3b82f6'];
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.8 }, colors });
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.8 }, colors });
    setTimeout(() => {
      confetti({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.6 }, colors });
    }, 500);
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 80, origin: { x: 0.3, y: 0.7 } });
      confetti({ particleCount: 60, spread: 80, origin: { x: 0.7, y: 0.7 } });
    }, 1200);
  }, [theme]);

  useEffect(() => {
    if (!hasLaunched.current) {
      hasLaunched.current = true;
      launchConfetti();
    }
  }, [launchConfetti]);

  const plainProcedureName = procedureName.replace(/<[^>]*>/g, '');
  const defaultMessage = `Olá! Tenho interesse em ser paciente modelo para ${plainProcedureName}!`;
  const rawPhone = whatsappNumber.replace(/\D/g, '');
  const e164Phone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
  const whatsappUrl = `https://wa.me/${e164Phone}?text=${encodeURIComponent(
    whatsappMessage || defaultMessage
  )}`;

  function handleWhatsAppClick(e: React.MouseEvent) {
    e.preventDefault();
    if (demo) {
      setShowDemoModal(true);
      return;
    }
    fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId, step: 5, answer: 'sim' }),
    }).catch(() => {});
    onTrackEvent?.('Contact');
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8 overflow-hidden">

      {/* Floating Balloons */}
      {BALLOONS.map((color, i) => (
        <div
          key={i}
          className="balloon absolute text-4xl"
          style={{
            left: `${10 + (i * 11)}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            bottom: '-10%',
          }}
        >
          <svg width="40" height="50" viewBox="0 0 40 50">
            <ellipse cx="20" cy="18" rx="16" ry="18" fill={color} opacity="0.85" />
            <path d="M20 36 L18 50 M20 36 L22 50" stroke={color} strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Content */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
        className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
      >
        <motion.svg
          className="w-14 h-14 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
            dangerouslySetInnerHTML={{ __html: customTexts?.celebrationTitle || 'Parabéns!' }}
          />
        </h1>
        <p className="text-xl text-gray-700 font-semibold mb-2"
          dangerouslySetInnerHTML={{ __html: customTexts?.celebrationSubtitle || 'Você foi qualificada para ser nossa paciente modelo!' }}
        />
        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto"
          dangerouslySetInnerHTML={{ __html: customTexts?.celebrationMessage || 'É só chamar a gente no WhatsApp e aguardar o retorno de uma das nossas consultoras 🥰' }}
        />
      </motion.div>

      <motion.a
        href={whatsappUrl}
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="z-10 inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-shadow whitespace-nowrap"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Falar pelo WhatsApp
      </motion.a>

      {/* ── Demo Modal ── */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              {/* WhatsApp header simulado */}
              <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-300 flex items-center justify-center text-green-800 font-bold text-sm flex-shrink-0">
                  CLI
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">Clínica Exemplo</p>
                  <p className="text-green-200 text-xs">online</p>
                </div>
                <svg className="w-5 h-5 text-green-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              {/* Chat simulado */}
              <div className="bg-[#ECE5DD] px-4 py-4 space-y-2 min-h-[120px]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm">
                    <p className="text-gray-800 text-sm">Olá! Tenho interesse em ser paciente modelo para {plainProcedureName}!</p>
                    <p className="text-gray-400 text-xs text-right mt-1">agora ✓✓</p>
                  </div>
                </motion.div>
              </div>

              {/* CTA */}
              <div className="bg-white px-5 py-5 text-center">
                <p className="font-bold text-gray-900 text-base mb-1">🎉 É assim que seus leads chegam!</p>
                <p className="text-gray-500 text-sm mb-4">Prontos para fechar, direto no seu WhatsApp.</p>
                <Link
                  href="/admin/cadastro"
                  className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg"
                >
                  Experimentar Grátis<br />por 7 dias →
                </Link>
                <button
                  onClick={() => { window.location.reload(); }}
                  className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Iniciar Teste
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
