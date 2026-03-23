'use client';

import { motion } from 'framer-motion';
import { Theme } from '@/lib/themes';

interface YesNoButtonsProps {
  onYes: () => void;
  onNo: () => void;
  yesText?: string;
  noText?: string;
  theme: Theme;
}

export default function YesNoButtons({ onYes, onNo, yesText = 'Sim', noText = 'Não', theme }: YesNoButtonsProps) {
  return (
    <div className="flex gap-3 w-full max-w-sm mx-auto">
      <motion.button
        onClick={onYes}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ background: theme.yesBtn }}
        onMouseEnter={e => (e.currentTarget.style.background = theme.yesBtnHover)}
        onMouseLeave={e => (e.currentTarget.style.background = theme.yesBtn)}
        className="flex-1 py-3 px-4 sm:py-4 sm:px-6 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg transition-shadow"
      >
        {yesText}
      </motion.button>
      <motion.button
        onClick={onNo}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-1 py-3 px-4 sm:py-4 sm:px-6 bg-gray-100 text-gray-600 font-bold text-base sm:text-lg rounded-2xl hover:bg-gray-200 transition-colors"
      >
        {noText}
      </motion.button>
    </div>
  );
}
