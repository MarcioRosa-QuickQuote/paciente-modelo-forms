'use client';

import { motion } from 'framer-motion';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';

interface Props {
  question: string;
  yesText?: string;
  noText?: string;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
}

export default function StepCustom({ question, yesText, noText, onYes, onNo, theme }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ background: theme.iconBg }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-lg"
      >
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight"
          dangerouslySetInnerHTML={{ __html: question }}
        />
      </motion.div>

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
    </div>
  );
}
