'use client';

import { motion } from 'framer-motion';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';
import { StepIconGlyph } from '@/lib/step-icons';
import { FormStep } from '@/types/form';
import StepCanvasElements, { stepHasCustomButtons } from './step-canvas-elements';

interface Props {
  question: string;
  yesText?: string;
  noText?: string;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
  step?: FormStep;
}

export default function StepCustom({ question, yesText, noText, onYes, onNo, theme, step }: Props) {
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
        <StepIconGlyph value={step?.icon} type="pergunta" svgClassName="w-10 h-10 text-white" emojiClassName="text-4xl leading-none" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight" dangerouslySetInnerHTML={{ __html: question }} />
      </motion.div>

      {!!step?.elements?.length && (
        <div className="w-full max-w-sm mb-8">
          <StepCanvasElements
            elements={step.elements || []}
            onYes={onYes}
            onNo={onNo}
            theme={theme}
            fallbackYesText={yesText || 'Sim'}
            fallbackNoText={noText || 'Não'}
            className="w-full space-y-4"
          />
        </div>
      )}

      {!hasCustomButtons && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full"
        >
          <YesNoButtons
            onYes={onYes}
            onNo={onNo}
            yesText={yesText || 'Sim'}
            noText={noText || 'Não'}
            theme={theme}
          />
        </motion.div>
      )}
    </div>
  );
}
