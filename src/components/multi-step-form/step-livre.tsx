'use client';

import { motion } from 'framer-motion';
import { FormStep } from '@/types/form';
import { Theme } from '@/lib/themes';
import StepCanvasElements, { stepHasCustomButtons } from './step-canvas-elements';

interface Props {
  step: FormStep;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
}

export default function StepLivre({ step, onYes, onNo, theme }: Props) {
  const elements = step.elements || [];
  const hasButtons = stepHasCustomButtons(elements);

  return (
    <div className="min-h-[100dvh] px-5 py-8 flex flex-col items-center">
      <StepCanvasElements
        elements={elements}
        onYes={onYes}
        onNo={onNo}
        theme={theme}
        fallbackYesText={step.yesText || 'Sim'}
        fallbackNoText={step.noText || 'Nao'}
        className="w-full max-w-sm space-y-4"
      />

      {!hasButtons && (
        <motion.button
          onClick={onYes}
          whileTap={{ scale: 0.95 }}
          style={{ background: theme.yesBtn }}
          className="w-full max-w-sm py-4 text-white font-bold text-lg rounded-2xl shadow-lg mt-4"
        >
          {step.yesText || 'Continuar'}
        </motion.button>
      )}
    </div>
  );
}
