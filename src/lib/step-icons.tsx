'use client';

import { ReactNode } from 'react';
import { FormStepType } from '@/types/form';

type StepIconRenderer = (className: string) => ReactNode;

interface StepIconOption {
  id: string;
  label: string;
  render: StepIconRenderer;
}

const STEP_ICON_RENDERERS: Record<string, StepIconRenderer> = {
  calendar: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  money: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shield: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  question: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.889a1 1 0 00-.364 1.118l1.519 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.889a1 1 0 00-1.176 0l-3.976 2.889c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.49 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
    </svg>
  ),
  heart: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
    </svg>
  ),
  sparkles: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18l-.813-2.096L6 15l2.187-.904L9 12l.813 2.096L12 15l-2.187.904zM18.259 8.715L18 10l-.259-1.285L16.5 8l1.241-.715L18 6l.259 1.285L19.5 8l-1.241.715zM4.259 8.715L4 10l-.259-1.285L2.5 8l1.241-.715L4 6l.259 1.285L5.5 8l-1.241.715zM16 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  ),
  clock: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  user: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.963 9.963 0 0112 15c2.584 0 4.94.98 6.72 2.587M15 9a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pin: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  nose: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4c1.8 3.1 2.4 5.5 2.4 8.1 0 1.1.7 2.1 1.7 2.7 1 .6 1.5 1.2 1.5 2 0 1.8-2.1 3.2-5.6 3.2s-5.6-1.4-5.6-3.2c0-.8.5-1.4 1.5-2 1-.6 1.7-1.6 1.7-2.7C9.6 9.5 10.2 7.1 12 4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 17.2c.6.5 1.3.8 2 .8s1.4-.3 2-.8" />
    </svg>
  ),
  lips: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10.5c1.8 2.5 4.8 4 8 4s6.2-1.5 8-4c-1.5-1.8-4.8-3.5-8-3.5s-6.5 1.7-8 3.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10.5c1.6 2.8 4.7 5.5 8 5.5s6.4-2.7 8-5.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.2 12.8c1 .7 2.4 1.2 3.8 1.2s2.8-.5 3.8-1.2" />
    </svg>
  ),
  eyes: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12S6.3 6.5 12 6.5 21.5 12 21.5 12 17.7 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7.5 4.5 6M18 7.5 19.5 6M6 16.5 4.5 18M18 16.5 19.5 18" />
    </svg>
  ),
  ears: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7c-1.7.6-3 2.5-3 5.1 0 2.9 1.5 5.2 3.4 5.9.8.3 1.4-.2 1.4-1v-2.6c0-.8-.6-1.5-1.4-1.8-.5-.2-.9-.7-.9-1.4 0-1.2.7-2.1 1.8-2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7c1.7.6 3 2.5 3 5.1 0 2.9-1.5 5.2-3.4 5.9-.8.3-1.4-.2-1.4-1v-2.6c0-.8.6-1.5 1.4-1.8.5-.2.9-.7.9-1.4 0-1.2-.7-2.1-1.8-2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 8.5c0-1.8.9-3.5 2-3.5s2 1.7 2 3.5" />
    </svg>
  ),
  syringe: className => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14 4 6 6M13 5l6 6M9 9l6 6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.5 9.5 6 6-4.8 4.8a2.2 2.2 0 0 1-3.1 0L3.7 17.4a2.2 2.2 0 0 1 0-3.1L8.5 9.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M20 6h-4M3 21l3-3" />
    </svg>
  ),
};

export const STEP_ICON_OPTIONS: StepIconOption[] = [
  { id: 'calendar', label: 'Calendario', render: STEP_ICON_RENDERERS.calendar },
  { id: 'money', label: 'Dinheiro', render: STEP_ICON_RENDERERS.money },
  { id: 'shield', label: 'Seguranca', render: STEP_ICON_RENDERERS.shield },
  { id: 'question', label: 'Pergunta', render: STEP_ICON_RENDERERS.question },
  { id: 'nose', label: 'Nariz', render: STEP_ICON_RENDERERS.nose },
  { id: 'lips', label: 'Boca', render: STEP_ICON_RENDERERS.lips },
  { id: 'eyes', label: 'Olhos', render: STEP_ICON_RENDERERS.eyes },
  { id: 'ears', label: 'Orelhas', render: STEP_ICON_RENDERERS.ears },
  { id: 'syringe', label: 'Seringa', render: STEP_ICON_RENDERERS.syringe },
  { id: 'star', label: 'Estrela', render: STEP_ICON_RENDERERS.star },
  { id: 'heart', label: 'Coracao', render: STEP_ICON_RENDERERS.heart },
  { id: 'sparkles', label: 'Destaque', render: STEP_ICON_RENDERERS.sparkles },
  { id: 'clock', label: 'Relogio', render: STEP_ICON_RENDERERS.clock },
  { id: 'user', label: 'Pessoa', render: STEP_ICON_RENDERERS.user },
  { id: 'pin', label: 'Local', render: STEP_ICON_RENDERERS.pin },
];

const ICON_CUSTOMIZABLE_TYPES: FormStepType[] = ['disponibilidade', 'preco', 'taxa', 'pergunta'];

export function canCustomizeStepIcon(type: FormStepType): boolean {
  return ICON_CUSTOMIZABLE_TYPES.includes(type);
}

export function getDefaultStepIconId(type: FormStepType): string {
  if (type === 'disponibilidade') return 'calendar';
  if (type === 'preco') return 'money';
  if (type === 'taxa') return 'shield';
  if (type === 'pergunta') return 'question';
  return 'star';
}

export function isPresetStepIcon(value?: string): boolean {
  return !!value && Object.prototype.hasOwnProperty.call(STEP_ICON_RENDERERS, value);
}

export function isUploadedStepIcon(value?: string): boolean {
  const normalizedValue = value?.trim() || '';
  return /^data:image\//i.test(normalizedValue) || /^https?:\/\//i.test(normalizedValue) || /^\//.test(normalizedValue);
}

interface StepIconGlyphProps {
  value?: string;
  type: FormStepType;
  svgClassName?: string;
  emojiClassName?: string;
  imgClassName?: string;
}

export function StepIconGlyph({
  value,
  type,
  svgClassName = 'w-6 h-6 text-white',
  emojiClassName = 'text-2xl leading-none',
  imgClassName = 'w-8 h-8 object-contain',
}: StepIconGlyphProps) {
  const resolvedValue = value?.trim() || getDefaultStepIconId(type);
  const preset = STEP_ICON_RENDERERS[resolvedValue];

  if (preset) return <>{preset(svgClassName)}</>;
  if (isUploadedStepIcon(resolvedValue)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedValue}
        alt=""
        aria-hidden="true"
        className={imgClassName}
      />
    );
  }

  return <span className={emojiClassName}>{resolvedValue}</span>;
}
