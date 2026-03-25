'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CanvasElement, FormStep } from '@/types/form';
import { Theme } from '@/lib/themes';
import Image from 'next/image';

interface Props {
  step: FormStep;
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
}

function getEmbedUrl(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

export default function StepLivre({ step, onYes, onNo, theme }: Props) {
  const elements = step.elements || [];
  const [values, setValues] = useState<Record<string, string>>({});

  const hasButtons = elements.some(el => el.type === 'buttons');

  function renderElement(el: CanvasElement) {
    switch (el.type) {
      case 'heading':
        return (
          <h2 key={el.id} className="text-2xl font-bold text-gray-900 leading-tight"
            dangerouslySetInnerHTML={{ __html: el.content || '' }} />
        );
      case 'text':
        return (
          <p key={el.id} className="text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: el.content || '' }} />
        );
      case 'image':
        return el.imageUrl ? (
          <div key={el.id} className="w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={el.imageUrl} alt="" className="w-full rounded-2xl object-cover max-h-64" />
          </div>
        ) : null;
      case 'video':
        return el.videoUrl ? (
          <div key={el.id} className="relative w-full rounded-2xl overflow-hidden bg-gray-100" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={getEmbedUrl(el.videoUrl)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        ) : null;
      case 'checklist':
        return (
          <ul key={el.id} className="space-y-2">
            {(el.content || '').split('\n').filter(Boolean).map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-gray-700">
                <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      case 'highlight':
        return (
          <div key={el.id} className="rounded-2xl px-5 py-4" style={{ background: el.color || '#f3f0ff' }}>
            <p className="text-gray-800 leading-snug" dangerouslySetInnerHTML={{ __html: el.content || '' }} />
          </div>
        );
      case 'input-text':
      case 'input-phone':
      case 'input-email':
      case 'input-number': {
        const inputType = el.type === 'input-phone' ? 'tel'
          : el.type === 'input-email' ? 'email'
          : el.type === 'input-number' ? 'number'
          : 'text';
        return (
          <div key={el.id} className="space-y-1.5">
            {el.label && (
              <label className="text-sm font-semibold text-gray-700">
                {el.label}{el.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
            )}
            <input
              type={inputType}
              placeholder={el.placeholder || ''}
              required={el.required}
              value={values[el.id] || ''}
              onChange={e => setValues(v => ({ ...v, [el.id]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
            />
          </div>
        );
      }
      case 'input-date':
        return (
          <div key={el.id} className="space-y-1.5">
            {el.label && (
              <label className="text-sm font-semibold text-gray-700">
                {el.label}{el.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
            )}
            <input
              type="date"
              required={el.required}
              value={values[el.id] || ''}
              onChange={e => setValues(v => ({ ...v, [el.id]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
            />
          </div>
        );
      case 'input-select':
        return (
          <div key={el.id} className="space-y-1.5">
            {el.label && (
              <label className="text-sm font-semibold text-gray-700">
                {el.label}{el.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
            )}
            <select
              required={el.required}
              value={values[el.id] || ''}
              onChange={e => setValues(v => ({ ...v, [el.id]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {(el.options || '').split('\n').filter(Boolean).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      case 'buttons':
        return (
          <div key={el.id} className="flex gap-3 w-full">
            <motion.button
              onClick={onYes}
              whileTap={{ scale: 0.95 }}
              style={{ background: theme.yesBtn }}
              className="flex-1 py-3.5 px-4 text-white font-bold text-base rounded-2xl shadow-lg"
            >
              {el.yesText || step.yesText || 'Sim'}
            </motion.button>
            <motion.button
              onClick={onNo}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3.5 px-4 bg-gray-100 text-gray-600 font-bold text-base rounded-2xl hover:bg-gray-200 transition-colors"
            >
              {el.noText || step.noText || 'Não'}
            </motion.button>
          </div>
        );
      case 'spacer':
        return <div key={el.id} className="h-4" />;
      case 'divider':
        return <hr key={el.id} className="border-gray-200" />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-[100dvh] px-5 py-8 flex flex-col gap-4">
      {elements.map(el => renderElement(el))}

      {!hasButtons && (
        <motion.button
          onClick={onYes}
          whileTap={{ scale: 0.95 }}
          style={{ background: theme.yesBtn }}
          className="w-full py-4 text-white font-bold text-lg rounded-2xl shadow-lg mt-4"
        >
          {step.yesText || 'Continuar'}
        </motion.button>
      )}
    </div>
  );
}
