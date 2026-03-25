'use client';

import { useState } from 'react';
import { FormInput, FormStep, PhotoPair } from '@/types/form';
import { getTheme, Theme } from '@/lib/themes';
import { formatCurrency } from '@/lib/utils';
import { stepHasCustomButtons } from './multi-step-form/step-canvas-elements';

interface Props {
  form: FormInput;
  photos: PhotoPair[];
  steps: FormStep[];
  currentIndex?: number;
  onCurrentIndexChange?: (index: number) => void;
}

type ViewMode = 'mobile' | 'desktop';

// ── Helper UI ─────────────────────────────────────────────────────────────────

function Btn({ gradient, text, outlined }: { gradient?: string; text: string; outlined?: boolean }) {
  return (
    <div
      className={`flex-1 py-2.5 px-3 text-center font-bold rounded-xl text-sm ${outlined ? 'bg-gray-100 text-gray-600' : 'text-white'}`}
      style={!outlined ? { background: gradient } : {}}
    >
      {text}
    </div>
  );
}

function StepIcon({ iconBg, children }: { iconBg: string; children: React.ReactNode }) {
  return (
    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md flex-shrink-0" style={{ background: iconBg }}>
      {children}
    </div>
  );
}

function getPreviewEmbedUrl(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function getPreviewMapsHref(address?: string, mapsUrl?: string): string {
  if (mapsUrl?.trim()) return mapsUrl.trim();
  if (!address?.trim()) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
}

function getPreviewWazeHref(address?: string, wazeUrl?: string): string {
  if (wazeUrl?.trim()) return wazeUrl.trim();
  if (!address?.trim()) return '';
  return `https://waze.com/ul?q=${encodeURIComponent(address.trim())}`;
}

function PreviewExtraElements({ step, theme, desktop }: { step?: FormStep; theme: Theme; desktop: boolean }) {
  const elements = step?.elements || [];
  const inputClass = `w-full border border-gray-200 rounded-xl px-3 py-2 ${desktop ? 'text-sm' : 'text-xs'} bg-gray-50 text-gray-400`;

  if (elements.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {elements.map(el => {
        if (el.type === 'heading') {
          return (
            <h2
              key={el.id}
              className={`font-bold text-gray-900 leading-tight ${desktop ? 'text-xl' : 'text-base'}`}
              dangerouslySetInnerHTML={{ __html: el.content || 'Titulo' }}
            />
          );
        }

        if (el.type === 'text') {
          return (
            <p
              key={el.id}
              className={`text-gray-600 leading-relaxed ${desktop ? 'text-sm' : 'text-xs'}`}
              dangerouslySetInnerHTML={{ __html: el.content || 'Texto...' }}
            />
          );
        }

        if (el.type === 'image') {
          return el.imageUrl
            ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={el.id} src={el.imageUrl} alt="" className="w-full rounded-xl object-cover max-h-48" />
            )
            : (
              <div key={el.id} className="w-full h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs">
                Imagem
              </div>
            );
        }

        if (el.type === 'video') {
          return el.videoUrl
            ? (
              <div key={el.id} className="relative w-full rounded-xl overflow-hidden bg-gray-100" style={{ paddingBottom: '56.25%' }}>
                <iframe src={getPreviewEmbedUrl(el.videoUrl)} className="absolute inset-0 w-full h-full" allowFullScreen />
              </div>
            )
            : (
              <div key={el.id} className="w-full h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs">
                Video
              </div>
            );
        }

        if (el.type === 'checklist') {
          return (
            <ul key={el.id} className="space-y-1.5">
              {(el.content || '').split('\n').filter(Boolean).map((item, i) => (
                <li key={i} className={`flex items-center gap-2 text-gray-700 ${desktop ? 'text-sm' : 'text-xs'}`}>
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
          );
        }

        if (el.type === 'highlight') {
          return (
            <div key={el.id} className="rounded-xl px-4 py-3" style={{ background: el.color || '#f3f0ff' }}>
              <p
                className={`text-gray-800 leading-snug ${desktop ? 'text-sm' : 'text-xs'}`}
                dangerouslySetInnerHTML={{ __html: el.content || 'Destaque...' }}
              />
            </div>
          );
        }

        if (el.type === 'input-text' || el.type === 'input-phone' || el.type === 'input-email' || el.type === 'input-number') {
          return (
            <div key={el.id} className="space-y-1">
              {el.label && (
                <label className={`${desktop ? 'text-xs' : 'text-[10px]'} font-semibold text-gray-600`}>
                  {el.label}
                  {el.required && ' *'}
                </label>
              )}
              <input type="text" placeholder={el.placeholder || ''} disabled className={inputClass} />
            </div>
          );
        }

        if (el.type === 'input-date') {
          return (
            <div key={el.id} className="space-y-1">
              {el.label && (
                <label className={`${desktop ? 'text-xs' : 'text-[10px]'} font-semibold text-gray-600`}>
                  {el.label}
                  {el.required && ' *'}
                </label>
              )}
              <input type="date" disabled className={inputClass} />
            </div>
          );
        }

        if (el.type === 'input-select') {
          return (
            <div key={el.id} className="space-y-1">
              {el.label && (
                <label className={`${desktop ? 'text-xs' : 'text-[10px]'} font-semibold text-gray-600`}>
                  {el.label}
                  {el.required && ' *'}
                </label>
              )}
              <select disabled className={inputClass}>
                <option>Selecione...</option>
                {(el.options || '').split('\n').filter(Boolean).map((opt, i) => (
                  <option key={i}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }

        if (el.type === 'buttons') {
          return (
            <div key={el.id} className="flex gap-2 w-full">
              <Btn gradient={theme.yesBtn} text={el.yesText || 'Sim'} />
              <Btn text={el.noText || 'Nao'} outlined />
            </div>
          );
        }

        if (el.type === 'location') {
          const mapsHref = getPreviewMapsHref(el.address, el.mapsUrl);
          const wazeHref = getPreviewWazeHref(el.address, el.wazeUrl);

          return (
            <div key={el.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: theme.accentLight, color: theme.accent }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-gray-900 ${desktop ? 'text-base' : 'text-sm'}`}>
                    {el.title || 'Como chegar'}
                  </p>
                  {el.address && (
                    <p className={`text-gray-600 whitespace-pre-line ${desktop ? 'text-sm' : 'text-xs'}`}>
                      {el.address}
                    </p>
                  )}
                </div>
              </div>

              {el.details && (
                <p className={`text-gray-500 whitespace-pre-line ${desktop ? 'text-sm' : 'text-xs'}`}>
                  {el.details}
                </p>
              )}

              {(mapsHref || wazeHref) && (
                <div className="flex gap-2 w-full">
                  {mapsHref && <Btn gradient={theme.yesBtn} text="Google Maps" />}
                  {wazeHref && <Btn text="Waze" outlined />}
                </div>
              )}
            </div>
          );
        }

        if (el.type === 'spacer') return <div key={el.id} className="h-4" />;
        if (el.type === 'divider') return <hr key={el.id} className="border-gray-200" />;
        return null;
      })}
    </div>
  );
}

// ── Step previews ─────────────────────────────────────────────────────────────

function PreviewFoto({ form, photos, theme, desktop, step }: { form: FormInput; photos: PhotoPair[]; theme: Theme; desktop: boolean; step?: FormStep }) {
  const ct = form.customTexts || {};
  const validPhotos = photos.filter(p => p.before || p.after);
  const photo = validPhotos[0] || { before: '', after: '' };
  const headline = form.headline || `Deseja ser <span style="background: linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">paciente modelo</span>?`;
  const supportText = form.supportText || 'Procedimento realizado por profissional especializado.';
  const hasCustomButtons = stepHasCustomButtons(step?.elements);
  void ct;

  return (
    <div className={`flex flex-col items-center ${desktop ? 'px-6 py-8 gap-5' : 'px-3 py-5 gap-3'}`}>
      <h3
        className={`font-bold text-gray-900 text-center leading-tight ${desktop ? 'text-xl' : 'text-sm'}`}
        dangerouslySetInnerHTML={{ __html: headline }}
      />

      {form.singlePhoto ? (
        /* Single centered photo */
        validPhotos.length > 0 && photo.before ? (
          <div className="w-3/4 mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.before} alt="Foto" className="w-full h-auto rounded-xl shadow" />
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center w-3/4 mx-auto">
            <span className="text-[10px] text-gray-400 font-medium">FOTO</span>
          </div>
        )
      ) : validPhotos.length > 0 ? (
        <div className={`grid grid-cols-2 w-full ${desktop ? 'gap-4' : 'gap-2'}`}>
          {(['before', 'after'] as const).map(type => (
            photo[type] ? (
              <div key={type} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo[type]} alt={type} className="w-full h-auto rounded-xl shadow" />
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white font-bold px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: desktop ? '11px' : '9px',
                    background: type === 'before' ? 'rgba(0,0,0,0.6)' : `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`
                  }}
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
        <div className={`grid grid-cols-2 w-full ${desktop ? 'gap-4' : 'gap-2'}`}>
          {['ANTES', 'DEPOIS'].map(label => (
            <div key={label} className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-[10px] text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}

      <p
        className={`text-gray-500 text-center ${desktop ? 'text-sm' : 'text-[11px]'}`}
        dangerouslySetInnerHTML={{ __html: supportText }}
      />

      {!!step?.elements?.length && <PreviewExtraElements step={step} theme={theme} desktop={desktop} />}

      {!hasCustomButtons && (
        <div className="flex gap-2 w-full">
          <Btn gradient={theme.yesBtn} text={step?.yesText || 'Sim, quero!'} />
          <Btn text={step?.noText || 'Não'} outlined />
        </div>
      )}
    </div>
  );
}

function PreviewDisponibilidade({ form, theme, desktop, step }: { form: FormInput; theme: Theme; desktop: boolean; step?: FormStep }) {
  const ct = form.customTexts || {};
  const question = ct.availabilityQuestion || 'Você teria disponibilidade em algum desses dias?';
  const durationNote = ct.durationNote || (form.procedureDuration ? `O procedimento dura cerca de ${form.procedureDuration}.` : 'O procedimento dura cerca de 2h.');
  const hasCustomButtons = stepHasCustomButtons(step?.elements);

  return (
    <div className={`flex flex-col items-center ${desktop ? 'px-6 py-8' : 'px-3 py-5'}`}>
      <StepIcon iconBg={theme.iconBg}>
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </StepIcon>

      <p
        className={`font-bold text-gray-900 text-center mb-3 leading-snug ${desktop ? 'text-base' : 'text-xs'}`}
        dangerouslySetInnerHTML={{ __html: question }}
      />

      {form.availableDays && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          {form.availableDays.split(', ').map((day, i) => (
            <span key={i} className="rounded-xl px-3 py-1.5 font-semibold"
              style={{ background: theme.accentLight, color: theme.accent, fontSize: desktop ? '12px' : '10px' }}>
              {day}
            </span>
          ))}
        </div>
      )}

      <p className={`text-gray-500 text-center mb-4 ${desktop ? 'text-sm' : 'text-[10px]'}`}
        dangerouslySetInnerHTML={{ __html: durationNote }}
      />

      {!!step?.elements?.length && <PreviewExtraElements step={step} theme={theme} desktop={desktop} />}

      {!hasCustomButtons && (
        <div className="flex gap-2 w-full">
          <Btn gradient={theme.yesBtn} text={step?.yesText || 'Sim, tenho!'} />
          <Btn text={step?.noText || 'Não'} outlined />
        </div>
      )}
    </div>
  );
}

function resolveTokens(text: string, procedureName: string, regularPrice: number): string {
  return text
    .replace(/\{procedureName\}/g, procedureName)
    .replace(/\{preco\}/g, formatCurrency(regularPrice));
}

function PreviewPreco({ form, theme, desktop, step }: { form: FormInput; theme: Theme; desktop: boolean; step?: FormStep }) {
  const ct = form.customTexts || {};
  const hasInstallment = form.installmentCount > 0 && form.installmentAmount > 0;
  const discount = form.regularPrice > 0 ? Math.round(((form.regularPrice - form.modelPrice) / form.regularPrice) * 100) : 0;
  const procedureName = form.procedureName || 'Procedimento';
  const hasCustomButtons = stepHasCustomButtons(step?.elements);
  const pricingContext = ct.pricingContext
    ? resolveTokens(ct.pricingContext, procedureName, form.regularPrice)
    : `Sabendo que um paciente de <strong>${procedureName}</strong> pagaria em média <span style="text-decoration:line-through;color:#9ca3af">${formatCurrency(form.regularPrice)}</span>.`;
  const pricingQuestion = ct.pricingQuestion
    ? resolveTokens(ct.pricingQuestion, procedureName, form.regularPrice)
    : `E por ser <strong>PACIENTE MODELO</strong> ganharia uma condição especial, teria disponibilidade de investir o valor abaixo?`;
  const pricingLabel = ct.pricingLabel || 'Valor especial paciente modelo';

  return (
    <div className={`flex flex-col items-center ${desktop ? 'px-6 py-8' : 'px-3 py-5'}`}>
      <StepIcon iconBg={theme.iconBg}>
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </StepIcon>

      <p
        className={`font-bold text-gray-900 text-center mb-1 leading-snug ${desktop ? 'text-base' : 'text-xs'}`}
        dangerouslySetInnerHTML={{ __html: pricingContext }}
      />
      <p className={`font-bold text-gray-900 text-center mb-3 leading-snug ${desktop ? 'text-base' : 'text-xs'}`}
        dangerouslySetInnerHTML={{ __html: pricingQuestion }}
      />

      <div className="rounded-2xl px-5 py-4 mb-3 text-center shadow-lg w-full"
        style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        <p className="text-white/80 text-xs mb-1" dangerouslySetInnerHTML={{ __html: pricingLabel }} />
        <p className={`text-white font-extrabold ${desktop ? 'text-3xl' : 'text-2xl'}`}>{formatCurrency(form.modelPrice)}</p>
        {hasInstallment && (
          <p className="text-white/80 text-xs mt-0.5">ou {form.installmentCount}x de {formatCurrency(form.installmentAmount)}</p>
        )}
        {discount > 0 && (
          <span className="inline-block bg-white/20 rounded-full px-2 py-0.5 text-white text-xs font-bold mt-1">{discount}% off</span>
        )}
      </div>

      {!!step?.elements?.length && <PreviewExtraElements step={step} theme={theme} desktop={desktop} />}

      {!hasCustomButtons && (
        <div className="flex gap-2 w-full">
          <Btn gradient={theme.yesBtn} text={step?.yesText || 'Sim!'} />
          <Btn text={step?.noText || 'Não'} outlined />
        </div>
      )}
    </div>
  );
}

function PreviewTaxa({ form, theme, desktop, step }: { form: FormInput; theme: Theme; desktop: boolean; step?: FormStep }) {
  const ct = form.customTexts || {};
  const feePrefix = ct.feeTextPrefix || 'Para reservar seu horário, pedimos um valor simbólico de';
  const feeBenefit = ct.feeBenefitText || 'Esse valor será abatido do procedimento.';
  const feeDeducted = ct.feeDeductedLabel || 'Valor abatido';
  const feeSafe = ct.feeSafeLabel || 'Seguro';
  const hasCustomButtons = stepHasCustomButtons(step?.elements);

  return (
    <div className={`flex flex-col items-center ${desktop ? 'px-6 py-8' : 'px-3 py-5'}`}>
      <StepIcon iconBg={theme.iconBg}>
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </StepIcon>

      <p className={`font-bold text-gray-900 text-center mb-2 leading-snug ${desktop ? 'text-base' : 'text-xs'}`}
        dangerouslySetInnerHTML={{ __html: feePrefix }}
      />
      <p className={`font-black mb-1 ${desktop ? 'text-4xl' : 'text-3xl'}`} style={{ color: theme.accent }}>
        {formatCurrency(form.feeAmount)}
      </p>
      <p className={`text-gray-400 text-center mb-2 ${desktop ? 'text-sm' : 'text-[10px]'}`}
        dangerouslySetInnerHTML={{ __html: feeBenefit }}
      />
      <div className="flex gap-2 mb-4">
        <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: theme.accentLight, color: theme.accent }} dangerouslySetInnerHTML={{ __html: feeDeducted }} />
        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-green-100 text-green-700" dangerouslySetInnerHTML={{ __html: feeSafe }} />
      </div>

      {!!step?.elements?.length && <PreviewExtraElements step={step} theme={theme} desktop={desktop} />}

      {!hasCustomButtons && (
        <div className="flex gap-2 w-full">
          <Btn gradient={theme.yesBtn} text={step?.yesText || 'Aceito o valor'} />
          <Btn text={step?.noText || 'Não'} outlined />
        </div>
      )}
    </div>
  );
}

function PreviewPergunta({ step, theme, desktop }: { step: FormStep; theme: Theme; desktop: boolean }) {
  const hasCustomButtons = stepHasCustomButtons(step.elements);

  return (
    <div className={`flex flex-col items-center ${desktop ? 'px-6 py-8' : 'px-3 py-5'}`}>
      <StepIcon iconBg={theme.iconBg}>
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </StepIcon>

      <p className={`font-bold text-gray-900 text-center mb-6 leading-snug ${desktop ? 'text-base' : 'text-sm'}`}
        dangerouslySetInnerHTML={{ __html: step.question || 'Pergunta personalizada...' }}
      />

      {!!step.elements?.length && <PreviewExtraElements step={step} theme={theme} desktop={desktop} />}

      {!hasCustomButtons && (
        <div className="flex gap-2 w-full">
          <Btn gradient={theme.yesBtn} text={step.yesText || 'Sim'} />
          <Btn text={step.noText || 'Não'} outlined />
        </div>
      )}
    </div>
  );
}

function PreviewLivre({ step, theme, desktop }: { step: FormStep; theme: Theme; desktop: boolean }) {
  const elements = step.elements || [];
  const px = desktop ? 'px-6' : 'px-4';

  if (elements.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center gap-3 ${desktop ? 'px-6 py-12' : 'px-4 py-10'}`}>
        <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <p className="text-gray-300 text-xs">Tela em branco</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${px} py-6`}>
      <PreviewExtraElements step={step} theme={theme} desktop={desktop} />
    </div>
  );
}

function PreviewCelebration({ form, theme, desktop }: { form: FormInput; theme: Theme; desktop: boolean }) {
  const ct = form.customTexts || {};
  const title = ct.celebrationTitle || 'Parabéns!';
  const subtitle = ct.celebrationSubtitle || 'Você foi qualificada para ser nossa paciente modelo!';
  const message = ct.celebrationMessage || 'É só chamar a gente no WhatsApp e aguardar o retorno de uma das nossas consultoras.';

  return (
    <div className={`flex flex-col items-center text-center ${desktop ? 'px-6 py-10 gap-4' : 'px-4 py-8 gap-3'}`}>
      <div className={desktop ? 'text-5xl' : 'text-4xl'}>🎉</div>
      <h3 className={`font-black text-gray-900 ${desktop ? 'text-2xl' : 'text-lg'}`} dangerouslySetInnerHTML={{ __html: title }} />
      <p className={`text-gray-600 leading-snug ${desktop ? 'text-base' : 'text-sm'}`} dangerouslySetInnerHTML={{ __html: subtitle }} />
      <p className={`text-gray-400 leading-relaxed ${desktop ? 'text-sm' : 'text-xs'}`} dangerouslySetInnerHTML={{ __html: message }} />
      <div className="w-full py-3 rounded-xl text-white font-bold text-sm"
        style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}>
        Falar pelo WhatsApp
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  foto: 'Fotos', disponibilidade: 'Disponibilidade',
  preco: 'Preço', taxa: 'Taxa', pergunta: 'Pergunta', livre: 'Tela Livre',
};

export default function FormPreviewPanel({ form, photos, steps, currentIndex, onCurrentIndexChange }: Props) {
  const [internalStep, setInternalStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const theme = getTheme(form.theme);
  const controlled = currentIndex !== undefined && onCurrentIndexChange !== undefined;
  const activeIndex = controlled ? currentIndex : internalStep;
  const setActiveIndex = controlled ? onCurrentIndexChange! : setInternalStep;

  const isCelebration = activeIndex === steps.length;
  const safeIndex = isCelebration ? steps.length - 1 : (steps.length > 0 ? Math.min(activeIndex, steps.length - 1) : 0);
  const step = steps[safeIndex];
  const totalCount = steps.length + 1; // +1 for celebration

  function renderStep(desktop: boolean) {
    if (isCelebration) return <PreviewCelebration form={form} theme={theme} desktop={desktop} />;
    if (!step) return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 px-4 text-center">
        <p className="text-xs">Adicione etapas para ver a pré-visualização</p>
      </div>
    );
    switch (step.type) {
      case 'foto': return <PreviewFoto form={form} photos={photos} theme={theme} desktop={desktop} step={step} />;
      case 'disponibilidade': return <PreviewDisponibilidade form={form} theme={theme} desktop={desktop} step={step} />;
      case 'preco': return <PreviewPreco form={form} theme={theme} desktop={desktop} step={step} />;
      case 'taxa': return <PreviewTaxa form={form} theme={theme} desktop={desktop} step={step} />;
      case 'pergunta': return <PreviewPergunta step={step} theme={theme} desktop={desktop} />;
      case 'livre': return <PreviewLivre step={step} theme={theme} desktop={desktop} />;
    }
  }

  const progressPct = isCelebration ? 100 : (steps.length > 0 ? ((safeIndex + 1) / steps.length) * 100 : 0);

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Pré-visualização</p>
            <p className="text-xs text-gray-400">
              {isCelebration ? 'Celebração' : (step ? STEP_LABELS[step.type] : '—')} · {steps.length > 0 ? `${activeIndex + 1}/${totalCount}` : '0/0'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile / Desktop toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                title="Mobile"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                title="Desktop"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Preview area */}
        <div className="p-3">
          {viewMode === 'mobile' ? (
            /* ── Phone frame ── */
            <div>
              <div className="mx-auto" style={{ width: '280px' }}>
              <div className="relative rounded-[38px] border-[8px] border-gray-800 overflow-hidden bg-white shadow-2xl" style={{ height: '580px' }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-800 rounded-b-2xl z-10" />
                {/* Status bar */}
                <div className="flex items-center justify-between px-4 pt-6 pb-1 bg-white">
                  <span className="text-[10px] font-semibold text-gray-800">9:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                    <svg className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-[3px] bg-gray-100">
                  <div className="h-full transition-all duration-300"
                    style={{ background: `linear-gradient(to right, ${theme.progressFrom}, ${theme.progressTo})`, width: `${progressPct}%` }} />
                </div>
                <div className="overflow-y-auto" style={{ height: 'calc(100% - 52px)' }}>
                  {renderStep(false)}
                </div>
              </div>
            </div>
            </div>
          ) : (
            /* ── Desktop / browser frame ── */
            <div className="rounded-xl border-2 border-gray-300 overflow-hidden bg-gray-100">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 border-b border-gray-300">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="flex-1 mx-3 bg-white rounded-md px-2 py-0.5 text-[10px] text-gray-400">
                  formulario/{form.name ? form.name.toLowerCase().replace(/\s+/g, '-') : 'meu-formulario'}
                </div>
              </div>
              {/* Page content */}
              <div className="bg-white overflow-y-auto" style={{ maxHeight: '660px', minHeight: '300px' }}>
                {/* Progress bar */}
                <div className="h-[3px] bg-gray-100">
                  <div className="h-full transition-all duration-300"
                    style={{ background: `linear-gradient(to right, ${theme.progressFrom}, ${theme.progressTo})`, width: `${progressPct}%` }} />
                </div>
                <div className="max-w-md mx-auto">
                  {renderStep(true)}
                </div>
              </div>
            </div>
          )}

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === activeIndex ? theme.gradientFrom : '#d1d5db' }}
              />
            ))}
            <button
              type="button"
              onClick={() => setActiveIndex(steps.length)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: isCelebration ? theme.gradientFrom : '#d1d5db' }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Exported mini preview (used in stats hover tooltip) ───────────────────────

export function StepPreviewContent({ form, photos, steps, stepIndex }: {
  form: FormInput;
  photos: PhotoPair[];
  steps: FormStep[];
  stepIndex: number; // 0-based; pass steps.length for celebration
}) {
  const theme = getTheme(form.theme);
  if (stepIndex >= steps.length) return <PreviewCelebration form={form} theme={theme} desktop={false} />;
  const step = steps[stepIndex];
  if (!step) return null;
  switch (step.type) {
    case 'foto': return <PreviewFoto form={form} photos={photos} theme={theme} desktop={false} step={step} />;
    case 'disponibilidade': return <PreviewDisponibilidade form={form} theme={theme} desktop={false} step={step} />;
    case 'preco': return <PreviewPreco form={form} theme={theme} desktop={false} step={step} />;
    case 'taxa': return <PreviewTaxa form={form} theme={theme} desktop={false} step={step} />;
    case 'pergunta': return <PreviewPergunta step={step} theme={theme} desktop={false} />;
    case 'livre': return <PreviewLivre step={step} theme={theme} desktop={false} />;
    default: return null;
  }
}
