'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import YesNoButtons from './yes-no-buttons';

interface Props {
  procedureName: string;
  beforeImage: string;
  afterImage: string;
  onYes: () => void;
  onNo: () => void;
}

export default function StepBeforeAfter({ procedureName, beforeImage, afterImage, onYes, onNo }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8">
      {/* Before/After Images */}
      {(beforeImage || afterImage) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm mb-8"
        >
          <div className="grid grid-cols-2 gap-3">
            {beforeImage && (
              <div className="relative">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={beforeImage}
                    alt="Antes"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                  ANTES
                </span>
              </div>
            )}
            {afterImage && (
              <div className="relative">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={afterImage}
                    alt="Depois"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  DEPOIS
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Deseja ser{' '}
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            paciente modelo
          </span>{' '}
          de{' '}
          {procedureName}
          ?
        </h1>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full"
      >
        <YesNoButtons
          onYes={onYes}
          onNo={onNo}
          yesText="Sim, quero!"
          noText="Não"
        />
      </motion.div>
    </div>
  );
}
