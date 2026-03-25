'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';
import { StepIconGlyph } from '@/lib/step-icons';
import { CustomTexts, FormStep } from '@/types/form';
import StepCanvasElements, { stepHasCustomButtons } from './step-canvas-elements';

interface Props {
  feeAmount: number;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
  yesText?: string;
  noText?: string;
  customTexts?: CustomTexts;
  step?: FormStep;
}

export default function StepFee({ feeAmount, onYes, onNo, theme, yesText, noText, customTexts, step }: Props) {
  const hasCustomButtons = stepHasCustomButtons(step?.elements);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ background: theme.iconBg }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-lg"
      >
        <StepIconGlyph value={step?.icon} type="taxa" svgClassName="w-10 h-10 text-white" emojiClassName="text-4xl leading-none" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-6"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-4">
          <span dangerouslySetInnerHTML={{ __html: customTexts?.feeTextPrefix || 'Para reservar seu horário na agenda, solicitamos um valor simbólico de' }} />{' '}
          <span
            className="bg-clip-text text-transparent font-extrabold"
            style={{ backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
          >
            {formatCurrency(feeAmount)}
          </span>.
        </h1>
        <p
          className="text-lg text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: customTexts?.feeBenefitText || 'Mas fique tranquilo(a)! Esse valor será abatido do valor do procedimento.' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex items-center gap-4 mb-10"
      >
        <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: theme.accentLight }}>
          <svg className="w-4 h-4" style={{ color: theme.accent }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium" style={{ color: theme.accent }} dangerouslySetInnerHTML={{ __html: customTexts?.feeDeductedLabel || 'Valor abatido' }} />
        </div>
        <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: theme.accentLight }}>
          <svg className="w-4 h-4" style={{ color: theme.accent }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium" style={{ color: theme.accent }} dangerouslySetInnerHTML={{ __html: customTexts?.feeSafeLabel || 'Seguro' }} />
        </div>
      </motion.div>

      {!!step?.elements?.length && (
        <div className="w-full max-w-sm mb-8">
          <StepCanvasElements
            elements={step.elements || []}
            onYes={onYes}
            onNo={onNo}
            theme={theme}
            fallbackYesText={yesText || 'Sim, concordo!'}
            fallbackNoText={noText || 'Não'}
            className="w-full space-y-4"
          />
        </div>
      )}

      {!hasCustomButtons && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full"
        >
          <YesNoButtons onYes={onYes} onNo={onNo} yesText={yesText || 'Sim, concordo!'} noText={noText || 'Não'} theme={theme} />
        </motion.div>
      )}
    </div>
  );
}
