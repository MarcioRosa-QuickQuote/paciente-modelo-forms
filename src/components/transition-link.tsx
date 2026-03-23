'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function TransitionLink({ href, className, children }: TransitionLinkProps) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => router.push(href), 550);
  }, [href, router, transitioning]);

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>

      <AnimatePresence>
        {transitioning && (
          <motion.div
            key="page-transition"
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-[#080010]" />

            {/* Glow center */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(236,72,153,0.15) 50%, transparent 70%)',
              }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* Logo mark */}
            <motion.div
              className="relative flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            >
              {/* Spinner ring */}
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <motion.circle
                    cx="28" cy="28" r="24"
                    fill="none"
                    stroke="url(#spin-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="150.8"
                    initial={{ strokeDashoffset: 150.8 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                  />
                  <defs>
                    <linearGradient id="spin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-base leading-none">
                    C<span className="text-pink-400">+</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
