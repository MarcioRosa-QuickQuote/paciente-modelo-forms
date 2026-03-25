'use client';

import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const NAMES = [
  'Ana', 'Beatriz', 'Camila', 'Daniela', 'Fernanda',
  'Gabriela', 'Helena', 'Isabela', 'Juliana', 'Larissa',
  'Mariana', 'Natalia', 'Patricia', 'Rafaela', 'Tainá',
  'Valentina', 'Bruna', 'Carolina', 'Letícia', 'Priscila',
];

function pickRandom<T>(arr: T[], exclude?: T[]): T {
  const pool = exclude ? arr.filter(x => !exclude.includes(x)) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface Toast {
  id: number;
  message: string;
  icon: 'person' | 'fire';
}

interface Props {
  demo?: boolean;
}

export default function SocialProofToasts({ demo }: Props) {
  const [toast, setToast] = useState<Toast | null>(null);
  const usedNames = useRef<string[]>([]);
  const vacancyCount = useRef(3);
  const toastId = useRef(0);

  useEffect(() => {
    if (demo) return;

    // Schedule: [delay_ms, type]
    // Alternates name → vacancy → name → vacancy → name → vacancy
    const schedule = [
      { delay: 4000  + Math.random() * 3000,  type: 'name'    },
      { delay: 14000 + Math.random() * 5000,  type: 'vacancy' },
      { delay: 28000 + Math.random() * 8000,  type: 'name'    },
      { delay: 45000 + Math.random() * 10000, type: 'vacancy' },
      { delay: 65000 + Math.random() * 10000, type: 'name'    },
      { delay: 85000 + Math.random() * 10000, type: 'vacancy' },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    schedule.forEach(({ delay, type }) => {
      const t = setTimeout(() => {
        let message: string;
        let icon: Toast['icon'];

        if (type === 'name') {
          const name = pickRandom(NAMES, usedNames.current);
          usedNames.current.push(name);
          message = `${name} acabou de preencher uma vaga`;
          icon = 'person';
        } else {
          const count = vacancyCount.current;
          if (count <= 0) return;
          message = count === 1 ? 'Resta apenas 1 vaga!' : `Restam apenas ${count} vagas`;
          icon = 'fire';
          vacancyCount.current--;
        }

        const id = ++toastId.current;
        setToast({ id, message, icon });
        setTimeout(() => setToast(prev => prev?.id === id ? null : prev), 4500);
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [demo]);

  return (
    <div className="fixed bottom-20 left-4 z-50 pointer-events-none max-w-[260px]">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex items-center gap-2.5 bg-white rounded-2xl shadow-xl border border-gray-100 px-3.5 py-2.5"
          >
            {toast.icon === 'person' ? (
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-base">
                🔥
              </div>
            )}
            <p className="text-xs font-semibold text-gray-800 leading-tight">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
