'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';
import { CustomTexts } from '@/types/form';

interface Props {
  procedureName: string;
  regularPrice: number;
  modelPrice: number;
  installmentCount: number;
  installmentAmount: number;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
  yesText?: string;
  noText?: string;
  customTexts?: CustomTexts;
}

export default function StepPricing({ procedureName, regularPrice, modelPrice, installmentCount, installmentAmount, onYes, onNo, theme, yesText, noText, customTexts }: Props) {
  const discount = Math.round(((regularPrice - modelPrice) / regularPrice) * 100);
  const hasInstallment = installmentCount > 0 && installmentAmount > 0;

  // Parcelado aparece primeiro (true = mostrando parcelado)
  const [showInstallment, setShowInstallment] = useState(hasInstallment);

  useEffect(() => {
    if (!hasInstallment) return;
    setShowInstallment(true);
    const timer = setInterval(() => {
      setShowInstallment(prev => !prev);
    }, 2500);
    return () => clearInterval(timer);
  }, [hasInstallment]);

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
        {customTexts?.pricingContext ? (
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2"
            dangerouslySetInnerHTML={{ __html: customTexts.pricingContext }} />
        ) : (
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
            Sabendo que um paciente de{' '}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
              {procedureName}
            </span>{' '}
            pagaria em média{' '}
            <span className="text-gray-400 line-through">{formatCurrency(regularPrice)}</span>.
          </h1>
        )}
        {customTexts?.pricingQuestion ? (
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mt-4"
            dangerouslySetInnerHTML={{ __html: customTexts.pricingQuestion }} />
        ) : (
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mt-4">
            E por ser{' '}
            <span className="font-extrabold uppercase bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
              paciente modelo
            </span>{' '}
            ganharia uma condição especial, teria disponibilidade de investir o valor abaixo?
          </p>
        )}
      </motion.div>

      {/* Price Card — altura fixa para evitar pulo de layout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
        style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
        className="rounded-3xl px-8 pt-6 pb-6 mb-10 text-center shadow-xl w-full max-w-sm"
      >
        <p className="text-white/80 text-sm font-medium mb-3">{customTexts?.pricingLabel || 'Valor especial paciente modelo'}</p>

        {/* Área de preço com altura fixa para não pular */}
        <div className="h-20 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {hasInstallment && showInstallment ? (
              <motion.div key="installment"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <p className="text-white text-4xl font-extrabold leading-none">
                  {installmentCount}x de {formatCurrency(installmentAmount)}
                </p>
                <p className="text-white/70 text-sm mt-1">no cartão</p>
              </motion.div>
            ) : (
              <motion.div key="cash"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <p className="text-white text-4xl font-extrabold leading-none">
                  {formatCurrency(modelPrice)}
                </p>
                {hasInstallment && <p className="text-white/70 text-sm mt-1">à vista</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mt-2">
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
        <YesNoButtons onYes={onYes} onNo={onNo} yesText={yesText || 'Sim!'} noText={noText || 'Não'} theme={theme} />
      </motion.div>
    </div>
  );
}
