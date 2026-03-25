'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormData, FormStep } from '@/types/form';
import { getTheme } from '@/lib/themes';
import StepBeforeAfter from './step-before-after';
import StepAvailability from './step-availability';
import StepPricing from './step-pricing';
import StepFee from './step-fee';
import StepCustom from './step-custom';
import StepLivre from './step-livre';
import RejectionScreen from './rejection-screen';
import CelebrationScreen from './celebration-screen';
import LeadFormScreen from './lead-form-screen';
import SocialProofToasts from './social-proof-toasts';
import Image from 'next/image';

// Default steps used when no custom steps are configured (legacy behavior)
const DEFAULT_STEPS: FormStep[] = [
  { id: 'foto', type: 'foto' },
  { id: 'disponibilidade', type: 'disponibilidade' },
  { id: 'preco', type: 'preco' },
  { id: 'taxa', type: 'taxa' },
];

function getRandomDirection() {
  const directions = [
    { enter: { x: 300, y: 0, opacity: 0 }, exit: { x: -300, y: 0, opacity: 0 } },
    { enter: { x: -300, y: 0, opacity: 0 }, exit: { x: 300, y: 0, opacity: 0 } },
    { enter: { x: 0, y: 300, opacity: 0 }, exit: { x: 0, y: -300, opacity: 0 } },
    { enter: { x: 0, y: -300, opacity: 0 }, exit: { x: 0, y: 300, opacity: 0 } },
    { enter: { x: 200, y: 200, opacity: 0 }, exit: { x: -200, y: -200, opacity: 0 } },
    { enter: { scale: 0.5, opacity: 0 }, exit: { scale: 1.5, opacity: 0 } },
    { enter: { x: -200, y: 150, opacity: 0 }, exit: { x: 200, y: -150, opacity: 0 } },
  ];
  return directions[Math.floor(Math.random() * directions.length)];
}

type SpecialScreen = 'rejected' | 'celebration';
type ScreenState = { type: 'step'; index: number } | { type: 'special'; screen: SpecialScreen };

interface Props {
  formData: FormData;
  clinicLogo?: string;
  pixelId?: string;
  capiToken?: string;
  demo?: boolean;
}

export default function MultiStepForm({ formData, clinicLogo, pixelId, capiToken, demo }: Props) {
  const steps = (formData.steps?.length > 0 ? formData.steps : DEFAULT_STEPS).filter(s => !s.hidden);
  const [state, setState] = useState<ScreenState>({ type: 'step', index: 0 });
  const theme = getTheme(formData.theme);

  const screenKey = state.type === 'step' ? `step-${state.index}` : state.screen;

  const variants = useMemo(() => {
    const dir = getRandomDirection();
    return {
      enter: { ...dir.enter },
      center: { x: 0, y: 0, scale: 1, opacity: 1 },
      exit: { ...dir.exit },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  const trackResponse = useCallback((stepIndex: number, answer: 'sim' | 'nao') => {
    fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: formData.id, step: stepIndex + 1, answer }),
    }).catch(() => {});
  }, [formData.id]);

  const firePixelEvent = useCallback((eventName: string, eventId: string) => {
    if (!pixelId) return;
    try {
      // @ts-expect-error fbq is injected by Meta Pixel
      if (typeof window !== 'undefined' && window.fbq) {
        // @ts-expect-error fbq is injected by Meta Pixel
        window.fbq('track', eventName, { content_name: formData.procedureName, content_ids: [formData.id] }, { eventID: eventId });
      }
    } catch {}
  }, [pixelId, formData.procedureName, formData.id]);

  const fireCapiEvent = useCallback((eventName: string, eventId: string) => {
    if (!capiToken) return;

    // Read Meta cookies for attribution
    function getCookie(name: string): string {
      if (typeof document === 'undefined') return '';
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : '';
    }
    const fbp = getCookie('_fbp');
    // fbc: prefer cookie, fall back to fbclid in URL
    let fbc = getCookie('_fbc');
    if (!fbc && typeof window !== 'undefined') {
      const fbclid = new URLSearchParams(window.location.search).get('fbclid');
      if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
    }

    const body = JSON.stringify({
      formId: formData.id,
      eventName,
      eventId,
      contentName: formData.procedureName,
      eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
      clientUserAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      fbp,
      fbc,
    });
    // sendBeacon garante envio mesmo quando o browser navega/suspende a aba (ex: abrir WhatsApp)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/meta-event', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/meta-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => {});
    }
  }, [capiToken, formData.id, formData.procedureName]);

  const trackEvent = useCallback((eventName: string) => {
    const eventId = crypto.randomUUID();
    firePixelEvent(eventName, eventId);
    fireCapiEvent(eventName, eventId);
  }, [firePixelEvent, fireCapiEvent]);

  // PageView via CAPI no mount (fbq já dispara pelo script inline)
  useEffect(() => {
    const eventId = crypto.randomUUID();
    fireCapiEvent('PageView', eventId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleYes() {
    if (state.type !== 'step') return;
    trackResponse(state.index, 'sim');
    const nextIndex = state.index + 1;
    if (nextIndex >= steps.length) {
      const eventId = crypto.randomUUID();
      firePixelEvent('Lead', eventId);
      fireCapiEvent('Lead', eventId);
      setState({ type: 'special', screen: 'celebration' });
    } else {
      setState({ type: 'step', index: nextIndex });
    }
  }

  function handleNo() {
    if (state.type !== 'step') return;
    trackResponse(state.index, 'nao');
    setState({ type: 'special', screen: 'rejected' });
  }

  const progressPercent = state.type === 'step'
    ? Math.round(((state.index + 1) / steps.length) * 100)
    : 100;

  const showHeader = state.type !== 'special';

  function renderStep(step: FormStep) {
    switch (step.type) {
      case 'foto':
        return (
          <StepBeforeAfter
            step={step}
            procedureName={formData.procedureName}
            photos={formData.photos}
            singlePhoto={formData.singlePhoto}
            headline={formData.headline}
            supportText={formData.supportText}
            onYes={handleYes}
            onNo={handleNo}
            theme={theme}
            yesText={step.yesText}
            noText={step.noText}
          />
        );
      case 'disponibilidade':
        return (
          <StepAvailability
            step={step}
            procedureName={formData.procedureName}
            availableDays={formData.availableDays}
            procedureDuration={formData.procedureDuration}
            onYes={handleYes}
            onNo={handleNo}
            theme={theme}
            yesText={step.yesText}
            noText={step.noText}
            customTexts={formData.customTexts}
          />
        );
      case 'preco':
        return (
          <StepPricing
            step={step}
            procedureName={formData.procedureName}
            regularPrice={formData.regularPrice}
            modelPrice={formData.modelPrice}
            installmentCount={formData.installmentCount}
            installmentAmount={formData.installmentAmount}
            showOnlyInstallment={formData.showOnlyInstallment}
            onYes={handleYes}
            onNo={handleNo}
            theme={theme}
            yesText={step.yesText}
            noText={step.noText}
            customTexts={formData.customTexts}
          />
        );
      case 'taxa':
        return (
          <StepFee
            step={step}
            feeAmount={formData.feeAmount}
            onYes={handleYes}
            onNo={handleNo}
            theme={theme}
            yesText={step.yesText}
            noText={step.noText}
            customTexts={formData.customTexts}
          />
        );
      case 'pergunta':
        return (
          <StepCustom
            step={step}
            question={step.question || 'Você está de acordo?'}
            yesText={step.yesText}
            noText={step.noText}
            onYes={handleYes}
            onNo={handleNo}
            theme={theme}
          />
        );
      case 'livre':
        return (
          <StepLivre
            step={step}
            onYes={handleYes}
            onNo={handleNo}
            theme={theme}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-[100dvh] bg-white overflow-hidden">
      <SocialProofToasts demo={demo} hasLogo={!!clinicLogo} />
      {/* Meta Pixel */}
      {pixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Clinic Logo */}
      {clinicLogo && showHeader && (
        <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-3 pb-2 bg-white/80 backdrop-blur-sm">
          <Image src={clinicLogo} alt="Logo da Clínica" width={120} height={40} className="h-10 w-auto object-contain" />
        </div>
      )}

      {/* Progress bar */}
      {showHeader && (
        <div className={`fixed left-0 right-0 z-50 h-1 bg-gray-100 ${clinicLogo ? 'top-[56px]' : 'top-0'}`}>
          <motion.div
            style={{ background: `linear-gradient(to right, ${theme.progressFrom}, ${theme.progressTo})` }}
            className="h-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className={clinicLogo && showHeader ? 'pt-14' : ''}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screenKey}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {state.type === 'step' && renderStep(steps[state.index])}

            {state.type === 'special' && state.screen === 'rejected' && (
              <RejectionScreen
                professionalName={formData.professionalName}
                instagramHandle={formData.instagramHandle}
                theme={theme}
              />
            )}

            {state.type === 'special' && state.screen === 'celebration' && formData.finalScreenType === 'form' ? (
              <LeadFormScreen
                formId={formData.id}
                formFields={formData.formFields}
                theme={theme}
                onTrackEvent={trackEvent}
              />
            ) : state.type === 'special' && state.screen === 'celebration' && (
              <CelebrationScreen
                formId={formData.id}
                whatsappNumber={formData.whatsappNumber}
                procedureName={formData.procedureName}
                whatsappMessage={formData.whatsappMessage}
                theme={theme}
                onTrackEvent={trackEvent}
                customTexts={formData.customTexts}
                demo={demo}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
