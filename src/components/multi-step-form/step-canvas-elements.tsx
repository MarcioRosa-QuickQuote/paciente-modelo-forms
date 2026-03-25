'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CanvasElement } from '@/types/form';
import { Theme } from '@/lib/themes';

interface Props {
  elements: CanvasElement[];
  onYes: () => void;
  onNo: () => void;
  theme: Theme;
  fallbackYesText?: string;
  fallbackNoText?: string;
  className?: string;
}

function getEmbedUrl(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function getMapsHref(address?: string, mapsUrl?: string): string {
  if (mapsUrl?.trim()) return mapsUrl.trim();
  if (!address?.trim()) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
}

function getWazeHref(address?: string, wazeUrl?: string): string {
  if (wazeUrl?.trim()) return wazeUrl.trim();
  if (!address?.trim()) return '';
  return `https://waze.com/ul?q=${encodeURIComponent(address.trim())}`;
}

function getEmbeddedMapUrl(address?: string): string {
  if (!address?.trim()) return '';
  return `https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export function stepHasCustomButtons(elements?: CanvasElement[]): boolean {
  return (elements || []).some(el => el.type === 'buttons');
}

export default function StepCanvasElements({
  elements,
  onYes,
  onNo,
  theme,
  fallbackYesText,
  fallbackNoText,
  className,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  function renderElement(el: CanvasElement) {
    switch (el.type) {
      case 'heading':
        return (
          <h2
            key={el.id}
            className="text-2xl font-bold text-gray-900 leading-tight"
            dangerouslySetInnerHTML={{ __html: el.content || '' }}
          />
        );
      case 'text':
        return (
          <p
            key={el.id}
            className="text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: el.content || '' }}
          />
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
            <iframe src={getEmbedUrl(el.videoUrl)} className="absolute inset-0 w-full h-full" allowFullScreen />
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
              {el.yesText || fallbackYesText || 'Sim'}
            </motion.button>
            <motion.button
              onClick={onNo}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3.5 px-4 bg-gray-100 text-gray-600 font-bold text-base rounded-2xl hover:bg-gray-200 transition-colors"
            >
              {el.noText || fallbackNoText || 'Não'}
            </motion.button>
          </div>
        );
      case 'location': {
        const mapsHref = getMapsHref(el.address, el.mapsUrl);
        const wazeHref = getWazeHref(el.address, el.wazeUrl);

        return (
          <div key={el.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: theme.accentLight, color: theme.accent }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {el.title || 'Como chegar'}
                </h3>
                {el.address && (
                  <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
                    {el.address}
                  </p>
                )}
              </div>
            </div>

            {el.details && (
              <p className="text-sm text-gray-500 whitespace-pre-line">
                {el.details}
              </p>
            )}

            {(mapsHref || wazeHref) && (
              <div className="flex flex-wrap gap-2">
                {mapsHref && (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ background: theme.yesBtn }}
                  >
                    Abrir no Maps
                  </a>
                )}
                {wazeHref && (
                  <a
                    href={wazeHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700"
                  >
                    Abrir no Waze
                  </a>
                )}
              </div>
            )}
          </div>
        );
      }
      case 'location-map': {
        const mapUrl = getEmbeddedMapUrl(el.address);

        return (
          <div key={el.id} className="space-y-3">
            {mapUrl ? (
              <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={mapUrl}
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
                Informe o endereço para exibir o mapa.
              </div>
            )}

            {el.showAddress && el.address && (
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 whitespace-pre-line">
                {el.address}
              </div>
            )}
          </div>
        );
      }
      case 'spacer':
        return <div key={el.id} className="h-4" />;
      case 'divider':
        return <hr key={el.id} className="border-gray-200" />;
      default:
        return null;
    }
  }

  return (
    <div className={className || 'w-full space-y-4'}>
      {elements.map(el => renderElement(el))}
    </div>
  );
}
