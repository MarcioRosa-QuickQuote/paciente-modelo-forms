'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';

interface Props {
  procedureName: string;
  regularPrice: number;
  modelPrice: number;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
}

export default function StepPricing({ procedureName, regularPrice, modelPrice, onYes, onNo, theme }: Props) {
  const discount = Math.round(((regularPrice - modelPrice) / regularPrice) * 100);

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-6"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
          Sabendo que um paciente de{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
          >
            {procedureName}
          </span>{' '}
          pagaria em média{' '}
          <span className="text-gray-400 line-through">{formatCurrency(regularPrice)}</span>.
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mt-4">
          E por ser paciente modelo ganharia uma condição especial, teria disponibilidade de investir o valor abaixo?
        </p>
      </motion.div>

      {/* Price Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
        style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
        className="rounded-3xl p-8 mb-10 text-center shadow-xl w-full max-w-sm"
      >
        <p className="text-white/80 text-sm font-medium mb-1">Valor especial paciente modelo</p>
        <p className="text-white text-5xl font-extrabold mb-2">{formatCurrency(modelPrice)}</p>
        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
          <p className="text-white text-sm font-bold">{discount}% de desconto</p>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full"
      >
        <YesNoButtons onYes={onYes} onNo={onNo} yesText="Sim!" noText="Não" theme={theme} />
      </motion.div>
    </div>
  );
}
