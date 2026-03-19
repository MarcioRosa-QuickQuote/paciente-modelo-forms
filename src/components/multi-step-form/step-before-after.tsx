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
  yesText?: string;
  noText?: string;
}

export default function StepBeforeAfter({ procedureName, photos, headline, supportText, onYes, onNo, theme, yesText, noText }: Props) {
  const validPhotos = photos.filter(p => p.before || p.after);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (validPhotos.length <= 1) return;
    const timer = setInterval(() => {
      setPhotoIndex(prev => (prev + 1) % validPhotos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [validPhotos.length]);

  const currentPhoto = validPhotos[photoIndex] || { before: '', after: '' };
  const headlineText = headline || `Deseja ser paciente modelo de ${procedureName}?`;
  const resolvedYesText = yesText || (headline ? 'Quero corrigir!' : 'Sim, quero!');
  const resolvedNoText = noText || 'Não';

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-8">

      {/* 1. HEADLINE (topo) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 w-full max-w-sm"
      >
        <h1
          className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight"
          dangerouslySetInnerHTML={{ __html: headline || `Deseja ser <span style="background: linear-gradient(to right, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">paciente modelo</span> de ${procedureName}?` }}
        />
      </motion.div>

      {/* 2. FOTOS (meio) */}
      {validPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-sm mb-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={photoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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

      {/* 3. TEXTO DE APOIO (abaixo das fotos) */}
      {supportText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-gray-600 text-sm mb-6"
          dangerouslySetInnerHTML={{ __html: supportText }}
        />
      )}

      {/* 4. BOTÕES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full"
      >
        <YesNoButtons onYes={onYes} onNo={onNo} yesText={resolvedYesText} noText={resolvedNoText} theme={theme} />
      </motion.div>
    </div>
  );
}
