'use client';

import { motion } from 'framer-motion';

interface YesNoButtonsProps {
  onYes: () => void;
  onNo: () => void;
  yesText?: string;
  noText?: string;
}

export default function YesNoButtons({ onYes, onNo, yesText = 'Sim', noText = 'Não' }: YesNoButtonsProps) {
  return (
    <div className="flex gap-4 w-full max-w-sm mx-auto">
      <motion.button
        onClick={onYes}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-shadow"
      >
        {yesText}
      </motion.button>
      <motion.button
        onClick={onNo}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-1 py-4 px-6 bg-gray-100 text-gray-600 font-bold text-lg rounded-2xl hover:bg-gray-200 transition-colors"
      >
        {noText}
      </motion.button>
    </div>
  );
}
