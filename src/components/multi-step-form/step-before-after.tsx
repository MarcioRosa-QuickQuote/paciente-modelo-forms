'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import YesNoButtons from './yes-no-buttons';
import { Theme } from '@/lib/themes';
import { PhotoPair } from '@/types/form';

interface Props {
  procedureName: string;
  photos: PhotoPair[];
  headline: string;
  supportText: string;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
}

export default function StepBeforeAfter({ procedureName, photos, headline, supportText, onYes, onNo, theme }: Props) {
  const validPhotos = photos.filter(p => p.before || p.after);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Auto-rotate photos every 3s if multiple pairs
  useEffect(() => {
    if (validPhotos.length <= 1) return;
    const timer = setInterval(() => {
      setPhotoIndex(prev => (prev + 1) % validPhotos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [validPhotos.length]);

  const currentPhoto = validPhotos[photoIndex] || { before: '', after: '' };

  const headlineText = headline || `Deseja ser paciente modelo de ${procedureName}?`;
  const yesText = headline ? 'Quero corrigir!' : 'Sim, quero!';

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8">
      {/* Photos */}
      {validPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm mb-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={photoIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              {currentPhoto.before && (
                <div className="relative">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <Image src={currentPhoto.before} alt="Antes" fill className="object-cover" />
                  </div>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                    ANTES
                  </span>
                </div>
              )}
              {currentPhoto.after && (
                <div className="relative">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <Image src={currentPhoto.after} alt="Depois" fill className="object-cover" />
                  </div>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
                    DEPOIS
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Photo dots indicator */}
          {validPhotos.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {validPhotos.map((_, i) => (
                <button key={i} onClick={() => setPhotoIndex(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === photoIndex ? theme.gradientFrom : '#d1d5db' }} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Support text */}
      {supportText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-gray-600 text-sm mb-4 max-w-sm"
        >
          {supportText}
        </motion.p>
      )}

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {headline ? (
            headlineText
          ) : (
            <>
              Deseja ser{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                paciente modelo
              </span>{' '}
              de {procedureName}?
            </>
          )}
        </h1>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full"
      >
        <YesNoButtons onYes={onYes} onNo={onNo} yesText={yesText} noText="Não" theme={theme} />
      </motion.div>
    </div>
  );
}
