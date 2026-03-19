'use client';

import { motion } from 'framer-motion';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';

interface Props {
  procedureName: string;
  availableDays: string;
  procedureDuration: string;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
}

export default function StepAvailability({ procedureName, availableDays, procedureDuration, onYes, onNo, theme }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ background: theme.iconBg }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-lg"
      >
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-6">
          Você teria disponibilidade em algum desses dias?
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {availableDays.split(', ').map((day, i) => (
            <span
              key={i}
              className="rounded-2xl px-5 py-3 text-base font-semibold"
              style={{ background: theme.accentLight, color: theme.accent, border: `1px solid ${theme.accent}20` }}
            >
              {day}
            </span>
          ))}
        </div>

        {procedureDuration && (
          <p className="text-gray-500 text-base">
            O procedimento dura cerca de {procedureDuration}.
          </p>
        )}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full"
      >
        <YesNoButtons onYes={onYes} onNo={onNo} yesText="Sim, tenho!" noText="Não" theme={theme} />
      </motion.div>
    </div>
  );
}
