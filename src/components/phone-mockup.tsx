'use client';

/**
 * PhoneMockup — componente guardado para uso futuro na landing page.
 * Foi removido temporariamente em favor do VSL (Video Sales Letter).
 * Para reativar: importar e usar na hero section de page.tsx.
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function PhoneMockup() {
  const [mockupClicked, setMockupClicked] = useState(false);

  useEffect(() => {
    const handleBlur = () => setMockupClicked(true);
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  return (
    <div className="flex-shrink-0 relative flex flex-col items-center mt-10 lg:mt-8">
      <div className="absolute -inset-10 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* "Teste aqui" label com seta curvada */}
      <motion.div
        className="absolute -left-36 top-8 hidden lg:flex flex-col items-start gap-0 z-20 pointer-events-none select-none"
        initial={{ opacity: 0, x: -10 }}
        animate={mockupClicked ? { opacity: 0 } : { opacity: [0, 1, 1, 0], x: [-10, 0, 0, 0] }}
        transition={mockupClicked ? { duration: 0.3 } : { delay: 1.2, duration: 3, times: [0, 0.2, 0.7, 1], repeat: Infinity, repeatDelay: 3 }}
      >
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
          <defs>
            <filter id="neonBlur2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <marker id="neonHead2" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0.5 L0,6.5 L6.5,3.5 z" fill="#e879f9" />
            </marker>
            <marker id="neonHeadGlow2" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0.5 L0,6.5 L6.5,3.5 z" fill="#e879f9" opacity="0.35" />
            </marker>
          </defs>
          <path d="M8 54 C 12 20, 55 4, 94 26" stroke="#e879f9" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.22" filter="url(#neonBlur2)" markerEnd="url(#neonHeadGlow2)" />
          <path d="M8 54 C 12 20, 55 4, 94 26" stroke="#e879f9" strokeWidth="2.5" strokeLinecap="round" fill="none" markerEnd="url(#neonHead2)" />
        </svg>
        <span
          className="text-white font-bold text-base -mt-1 ml-1"
          style={{ fontFamily: 'cursive', textShadow: '0 0 16px rgba(232,121,249,0.8)' }}
        >
          Teste aqui!
        </span>
      </motion.div>

      <div
        className="relative"
        style={{
          width: 310,
          background: 'linear-gradient(170deg, #3a3a3e 0%, #1e1e22 50%, #111113 100%)',
          borderRadius: 50,
          padding: '9px',
          boxShadow: [
            '0 0 0 1px #444448',
            '0 2px 0 1px #555558',
            '0 60px 80px -10px rgba(0,0,0,0.9)',
            '0 30px 50px rgba(109,40,217,0.2)',
            'inset 0 1px 0 rgba(255,255,255,0.12)',
            'inset 0 -1px 0 rgba(0,0,0,0.5)',
          ].join(', '),
        }}
      >
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[85px] w-[3px] h-6 rounded-l" style={{ background: 'linear-gradient(to right, #555, #333)' }} />
        <div className="absolute -left-[3px] top-[122px] w-[3px] h-10 rounded-l" style={{ background: 'linear-gradient(to right, #555, #333)' }} />
        <div className="absolute -left-[3px] top-[176px] w-[3px] h-10 rounded-l" style={{ background: 'linear-gradient(to right, #555, #333)' }} />
        <div className="absolute -right-[3px] top-[138px] w-[3px] h-14 rounded-r" style={{ background: 'linear-gradient(to left, #555, #333)' }} />

        {/* Screen */}
        <div style={{ borderRadius: 42, overflow: 'hidden', background: '#000', position: 'relative' }}>
          {/* Dynamic island */}
          <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 96, height: 26, background: '#000', borderRadius: 16, zIndex: 10, boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }} />

          {/* Status bar */}
          <div style={{ height: 46, background: '#fff', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 5px', fontSize: 10, fontWeight: 600, color: '#111', position: 'relative', zIndex: 5 }}>
            <span>9:41</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <svg width="14" height="10" viewBox="0 0 15 11" fill="none"><rect x="0" y="4" width="3" height="7" rx="1" fill="#111"/><rect x="4" y="2.5" width="3" height="8.5" rx="1" fill="#111"/><rect x="8" y="1" width="3" height="10" rx="1" fill="#111"/><rect x="12" y="0" width="3" height="11" rx="1" fill="#111"/></svg>
              <svg width="15" height="10" viewBox="0 0 16 11" fill="none"><path d="M8 2.2C10.5 2.2 12.7 3.3 14.2 5L15.5 3.6C13.6 1.4 10.9 0 8 0C5.1 0 2.4 1.4 0.5 3.6L1.8 5C3.3 3.3 5.5 2.2 8 2.2Z" fill="#111"/><path d="M8 5.5C9.7 5.5 11.2 6.2 12.3 7.4L13.6 6C12.1 4.4 10.2 3.4 8 3.4C5.8 3.4 3.9 4.4 2.4 6L3.7 7.4C4.8 6.2 6.3 5.5 8 5.5Z" fill="#111"/><circle cx="8" cy="10" r="1.5" fill="#111"/></svg>
              <svg width="23" height="11" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#111" strokeOpacity="0.35"/><rect x="1.5" y="1.5" width="17" height="9" rx="2.5" fill="#111"/><path d="M23 4V8C23.8 7.7 24.5 7 24.5 6C24.5 5 23.8 4.3 23 4Z" fill="#111" fillOpacity="0.4"/></svg>
            </div>
          </div>

          {/* iframe */}
          <iframe
            src="/formulario/blefaroplastia?demo=true"
            style={{ width: 292, height: 560, border: 'none', display: 'block' }}
            title="Demo Capta+"
          />

          {/* Home indicator */}
          <div style={{ height: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 88, height: 4, background: '#111', borderRadius: 4, opacity: 0.16 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
