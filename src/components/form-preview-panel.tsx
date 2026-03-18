'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FormInput, FormStep, PhotoPair } from '@/types/form';
import { getTheme, Theme } from '@/lib/themes';
import { formatCurrency } from '@/lib/utils';

interface Props {
  form: FormInput;
  photos: PhotoPair[];
  steps: FormStep[];
}

function Btn({ gradient, text, outlined }: { gradient?: string; text: string; outlined?: boolean }) {
  return (
    <div
      className={`flex-1 py-2.5 px-3 text-center font-bold text-xs rounded-xl ${outlined ? 'bg-gray-100 text-gray-600' : 'text-white'}`}
      style={!outlined ? { background: gradient } : {}}
    >
      {text}
    </div>
  );
}

function Icon({ iconBg, children }: { iconBg: string; children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md flex-shrink-0" style={{ background: iconBg }}>
      {children}
    </div>
  );
}

// ── Step previews ─────────────────────────────────────────────────────────────

function PreviewFoto({ form, photos, theme }: { form: FormInput; photos: PhotoPair[]; theme: Theme }) {
  const validPhotos = photos.filter(p => p.before || p.after);
  const photo = validPhotos[0] || { before: '', after: '' };
  const headline = form.headline || `Deseja ser paciente modelo de ${form.procedureName || '...'}?`;
  const yesText = form.headline ? 'Quero corrigir!' : 'Sim, quero!';

  return (
    <div className="flex flex-col items-center px-3 py-5 gap-3">
      <h3 className="text-sm font-bold text-gray-900 text-center leading-tight">{headline}</h3>

      {validPhotos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 w-full">
          {(['before', 'after'] as const).map(type => (
            photo[type] ? (
              <div key={type} className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={photo[type]} alt={type} fill className="object-cover" />
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: type === 'before' ? 'rgba(0,0,0,0.6)' : `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})` }}
                >
                  {type === 'before' ? 'ANTES' : 'DEPOIS'}
                </span>
              </div>
            ) : (
              <div key={type} className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-[10px] text-gray-400 font-medium">{type === 'before' ? 'ANTES' : 'DEPOIS'}</span>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 w-full">
          {['ANTES', 'DEPOIS'].map(label => (
            <div key={label} className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-[10px] text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}

      {form.supportText && (
        <p className="text-[11px] text-gray-500 text-center">{form.supportText}</p>
      )}

      <div className="flex gap-2 w-full">
        <Btn gradient={theme.yesBtn} text={yesText} />
        <Btn text="Não" outlined />
      </div>
    </div>
  );
}

function PreviewDisponibilidade({ form, theme }: { form: FormInput; theme: Theme }) {
  return (
    <div className="flex flex-col items-center px-3 py-5">
      <Icon iconBg={theme.iconBg}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </Icon>

      <p className="text-xs font-bold text-gray-900 text-center mb-3 leading-snug">
        {form.procedureDuration
          ? <>Tem disponibilidade em um dos dias abaixo<br />tendo em vista que o procedimento dura em média {form.procedureDuration}?</>
          : 'Tem disponibilidade em um dos dias abaixo?'
        }
      </p>

      {form.availableDays && (
        <div className="rounded-xl px-3 py-2 mb-3 w-full text-center text-[11px] font-semibold" style={{ background: theme.accentLight, color: theme.accent }}>
          {form.availableDays}
        </div>
      )}

      <div className="flex gap-2 w-full">
        <Btn gradient={theme.yesBtn} text="Sim, tenho!" />
        <Btn text="Não" outlined />
      </div>
    </div>
  );
}

function PreviewPreco({ form, theme }: { form: FormInput; theme: Theme }) {
  const hasInstallment = form.installmentCount > 0 && form.installmentAmount > 0;
  const discount = form.regularPrice > 0 ? Math.round(((form.regularPrice - form.modelPrice) / form.regularPrice) * 100) : 0;

  return (
    <div className="flex flex-col items-center px-3 py-5">
      <Icon iconBg={theme.iconBg}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Icon>

      <p className="text-xs font-bold text-gray-900 text-center mb-3 leading-snug">
        Normalmente custa <span className="line-through text-gray-400">{formatCurrency(form.regularPrice)}</span>.<br />
        Como paciente modelo você pagaria:
      </p>

      <div className="rounded-2xl px-5 py-3 mb-3 text-center shadow-lg w-full" style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        <p className="text-white/80 text-[10px] mb-1">Valor especial paciente modelo</p>
        <p className="text-white text-2xl font-extrabold">{formatCurrency(form.modelPrice)}</p>
        {hasInstallment && (
          <p className="text-white/80 text-[10px] mt-0.5">ou {form.installmentCount}x de {formatCurrency(form.installmentAmount)}</p>
        )}
        {discount > 0 && (
          <span className="inline-block bg-white/20 rounded-full px-2 py-0.5 text-white text-[10px] font-bold mt-1">{discount}% off</span>
        )}
      </div>

      <div className="flex gap-2 w-full">
        <Btn gradient={theme.yesBtn} text="Sim!" />
        <Btn text="Não" outlined />
      </div>
    </div>
  );
}

function PreviewTaxa({ form, theme }: { form: FormInput; theme: Theme }) {
  return (
    <div className="flex flex-col items-center px-3 py-5">
      <Icon iconBg={theme.iconBg}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </Icon>

      <p className="text-xs font-bold text-gray-900 text-center mb-2 leading-snug">
        Para garantir sua vaga, pedimos um valor simbólico:
      </p>
      <p className="text-3xl font-black mb-1" style={{ color: theme.accent }}>{formatCurrency(form.feeAmount)}</p>
      <p className="text-[10px] text-gray-400 text-center mb-4">
        Esse valor confirma seu comprometimento e garante sua vaga.
      </p>

      <div className="flex gap-2 w-full">
        <Btn gradient={theme.yesBtn} text="Aceito o valor" />
        <Btn text="Não" outlined />
      </div>
    </div>
  );
}

function PreviewPergunta({ step, theme }: { step: FormStep; theme: Theme }) {
  return (
    <div className="flex flex-col items-center px-3 py-5">
      <Icon iconBg={theme.iconBg}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Icon>

      <p className="text-sm font-bold text-gray-900 text-center mb-6 leading-snug">
        {step.question || <span className="text-gray-400 italic">Pergunta personalizada...</span>}
      </p>

      <div className="flex gap-2 w-full">
        <Btn gradient={theme.yesBtn} text={step.yesText || 'Sim'} />
        <Btn text={step.noText || 'Não'} outlined />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  foto: 'Fotos',
  disponibilidade: 'Disponibilidade',
  preco: 'Preço',
  taxa: 'Taxa',
  pergunta: 'Pergunta',
};

export default function FormPreviewPanel({ form, photos, steps }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const theme = getTheme(form.theme);
  const safeIndex = Math.min(currentStep, Math.max(0, steps.length - 1));
  const step = steps[safeIndex];

  function renderStep() {
    if (!step) return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 px-4 text-center">
        <p className="text-xs">Adicione etapas para ver a pré-visualização</p>
      </div>
    );
    switch (step.type) {
      case 'foto': return <PreviewFoto form={form} photos={photos} theme={theme} />;
      case 'disponibilidade': return <PreviewDisponibilidade form={form} theme={theme} />;
      case 'preco': return <PreviewPreco form={form} theme={theme} />;
      case 'taxa': return <PreviewTaxa form={form} theme={theme} />;
      case 'pergunta': return <PreviewPergunta step={step} theme={theme} />;
    }
  }

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div>
            <p className="text-sm font-semibold text-gray-800">Pré-visualização</p>
            <p className="text-xs text-gray-400">
              {step ? STEP_LABELS[step.type] : '—'} · {steps.length > 0 ? `${safeIndex + 1}/${steps.length}` : '0/0'}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
              disabled={safeIndex === 0}
              className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(p => Math.min(steps.length - 1, p + 1))}
              disabled={safeIndex >= steps.length - 1}
              className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="p-3">
          <div className="relative rounded-[24px] border-[5px] border-gray-800 overflow-hidden bg-white shadow-inner">
            {/* Progress bar */}
            <div className="h-[3px] bg-gray-100">
              <div
                className="h-full transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${theme.progressFrom}, ${theme.progressTo})`,
                  width: steps.length > 0 ? `${((safeIndex + 1) / steps.length) * 100}%` : '0%',
                }}
              />
            </div>

            {/* Step content */}
            <div className="overflow-y-auto" style={{ maxHeight: '520px', minHeight: '200px' }}>
              {renderStep()}
            </div>
          </div>

          {/* Dots */}
          {steps.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentStep(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === safeIndex ? theme.gradientFrom : '#d1d5db' }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
