'use client';

import { motion } from 'framer-motion';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';
import { sanitizeRichTextHtml } from '@/lib/rich-text';
import { StepIconGlyph } from '@/lib/step-icons';
import { FormStep, WorkflowOption } from '@/types/form';
import { isDecisionStep } from '@/lib/workflow';
import WorkflowOptionGrid from '@/components/workflow-option-grid';
import StepCanvasElements, { stepHasCustomButtons } from './step-canvas-elements';

interface Props {
  question: string;
  yesText?: string;
  noText?: string;
  onYes: () => void;
  onNo: () => void;
  onSelectOption?: (option: WorkflowOption) => void;
  theme: Theme;
  step?: FormStep;
}

export default function StepCustom({ question, yesText, noText, onYes, onNo, onSelectOption, theme, step }: Props) {
  const decisionMode = isDecisionStep(step);
  const elements = decisionMode
    ? (step?.elements || []).filter(element => element.type !== 'buttons')
    : (step?.elements || []);
  const hasCustomButtons = !decisionMode && stepHasCustomButtons(step?.elements);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ background: theme.iconBg }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
      >
        <StepIconGlyph value={step?.icon} type="pergunta" svgClassName="h-10 w-10 text-white" emojiClassName="text-4xl leading-none" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-10 text-center"
      >
        <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(question, { singleLine: true }) }} />
      </motion.div>

      {!!elements.length && (
        <div className="mb-8 w-full max-w-sm">
          <StepCanvasElements
            elements={elements}
            onYes={onYes}
            onNo={onNo}
            theme={theme}
            fallbackYesText={yesText || 'Sim'}
            fallbackNoText={noText || 'Não'}
            className="w-full space-y-4"
          />
        </div>
      )}

      {decisionMode ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="w-full max-w-sm"
        >
          <WorkflowOptionGrid
            options={step?.workflowOptions || []}
            theme={theme}
            onSelect={option => onSelectOption?.(option)}
          />
        </motion.div>
      ) : !hasCustomButtons && (
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
