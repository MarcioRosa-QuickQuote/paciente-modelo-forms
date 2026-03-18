'use client';

import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormData } from '@/types/form';
import { getTheme } from '@/lib/themes';
import StepBeforeAfter from './step-before-after';
import StepAvailability from './step-availability';
import StepPricing from './step-pricing';
import StepFee from './step-fee';
import RejectionScreen from './rejection-screen';
import CelebrationScreen from './celebration-screen';
import LeadFormScreen from './lead-form-screen';
import Image from 'next/image';

type Screen = 'step1' | 'step2' | 'step3' | 'step4' | 'rejected' | 'celebration';

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

const STEP_MAP: Record<string, number> = {
  step1: 1, step2: 2, step3: 3, step4: 4,
};

interface Props {
  formData: FormData;
  clinicLogo?: string;
  pixelId?: string;
  capiToken?: string;
}

export default function MultiStepForm({ formData, clinicLogo, pixelId, capiToken }: Props) {
  const [screen, setScreen] = useState<Screen>('step1');
  const theme = getTheme(formData.theme);

  const variants = useMemo(() => {
    const dir = getRandomDirection();
    return {
      enter: { ...dir.enter },
      center: { x: 0, y: 0, scale: 1, opacity: 1 },
      exit: { ...dir.exit },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const trackResponse = useCallback((step: number, answer: 'sim' | 'nao') => {
    fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: formData.id, step, answer }),
    }).catch(() => {});
  }, [formData.id]);

  const firePixelEvent = useCallback((eventName: string, eventId: string) => {
    if (!pixelId) return;
    try {
      // @ts-expect-error fbq is injected by Meta Pixel
      if (typeof window !== 'undefined' && window.fbq) {
        // @ts-expect-error fbq is injected by Meta Pixel
        window.fbq('track', eventName, {}, { eventID: eventId });
      }
    } catch {}
  }, [pixelId]);

  const fireCapiEvent = useCallback((eventName: string, eventId: string) => {
    if (!capiToken) return;
    fetch('/api/meta-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: formData.id,
        eventName,
        eventId,
        eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
        clientUserAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      }),
    }).catch(() => {});
  }, [capiToken, formData.id]);

  function handleYes(nextScreen: Screen) {
    const stepNum = STEP_MAP[screen];
    if (stepNum) trackResponse(stepNum, 'sim');
    if (nextScreen === 'celebration') {
      const eventId = crypto.randomUUID();
      firePixelEvent('Lead', eventId);
      fireCapiEvent('Lead', eventId);
    }
    setScreen(nextScreen);
  }

  function handleNo() {
    const stepNum = STEP_MAP[screen];
    if (stepNum) trackResponse(stepNum, 'nao');
    setScreen('rejected');
  }

  const showHeader = !['rejected', 'celebration'].includes(screen);

  return (
    <div className="min-h-[100dvh] bg-white overflow-hidden">
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
            animate={{
              width:
                screen === 'step1' ? '25%' :
                screen === 'step2' ? '50%' :
                screen === 'step3' ? '75%' :
                '100%',
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className={clinicLogo && showHeader ? 'pt-14' : ''}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {screen === 'step1' && (
              <StepBeforeAfter
                procedureName={formData.procedureName}
                photos={formData.photos}
                headline={formData.headline}
                supportText={formData.supportText}
                onYes={() => handleYes('step2')}
                onNo={handleNo}
                theme={theme}
              />
            )}

            {screen === 'step2' && (
              <StepAvailability
                procedureName={formData.procedureName}
                availableDays={formData.availableDays}
                procedureDuration={formData.procedureDuration}
                onYes={() => handleYes('step3')}
                onNo={handleNo}
                theme={theme}
              />
            )}

            {screen === 'step3' && (
              <StepPricing
                procedureName={formData.procedureName}
                regularPrice={formData.regularPrice}
                modelPrice={formData.modelPrice}
                installmentCount={formData.installmentCount}
                installmentAmount={formData.installmentAmount}
                onYes={() => handleYes('step4')}
                onNo={handleNo}
                theme={theme}
              />
            )}

            {screen === 'step4' && (
              <StepFee
                feeAmount={formData.feeAmount}
                onYes={() => handleYes('celebration')}
                onNo={handleNo}
                theme={theme}
              />
            )}

            {screen === 'rejected' && (
              <RejectionScreen
                professionalName={formData.professionalName}
                instagramHandle={formData.instagramHandle}
                theme={theme}
              />
            )}

            {screen === 'celebration' && formData.finalScreenType === 'form' ? (
              <LeadFormScreen
                formId={formData.id}
                formFields={formData.formFields}
                theme={theme}
              />
            ) : screen === 'celebration' && (
              <CelebrationScreen
                formId={formData.id}
                whatsappNumber={formData.whatsappNumber}
                procedureName={formData.procedureName}
                whatsappMessage={formData.whatsappMessage}
                theme={theme}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
