'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormData } from '@/types/form';
import StepBeforeAfter from './step-before-after';
import StepAvailability from './step-availability';
import StepPricing from './step-pricing';
import StepFee from './step-fee';
import RejectionScreen from './rejection-screen';
import CelebrationScreen from './celebration-screen';

type Screen = 'step1' | 'step2' | 'step3' | 'step4' | 'rejected' | 'celebration';

const slideVariants = {
  enter: { x: 300, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
};

interface Props {
  formData: FormData;
}

export default function MultiStepForm({ formData }: Props) {
  const [screen, setScreen] = useState<Screen>('step1');

  function handleNo() {
    setScreen('rejected');
  }

  return (
    <div className="min-h-[100dvh] bg-white overflow-hidden">
      {/* Progress bar */}
      {!['rejected', 'celebration'].includes(screen) && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
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

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {screen === 'step1' && (
            <StepBeforeAfter
              procedureName={formData.procedureName}
              beforeImage={formData.beforeImage}
              afterImage={formData.afterImage}
              onYes={() => setScreen('step2')}
              onNo={handleNo}
            />
          )}

          {screen === 'step2' && (
            <StepAvailability
              procedureName={formData.procedureName}
              availableDays={formData.availableDays}
              onYes={() => setScreen('step3')}
              onNo={handleNo}
            />
          )}

          {screen === 'step3' && (
            <StepPricing
              procedureName={formData.procedureName}
              regularPrice={formData.regularPrice}
              modelPrice={formData.modelPrice}
              onYes={() => setScreen('step4')}
              onNo={handleNo}
            />
          )}

          {screen === 'step4' && (
            <StepFee
              feeAmount={formData.feeAmount}
              onYes={() => setScreen('celebration')}
              onNo={handleNo}
            />
          )}

          {screen === 'rejected' && (
            <RejectionScreen
              professionalName={formData.professionalName}
              instagramHandle={formData.instagramHandle}
            />
          )}

          {screen === 'celebration' && (
            <CelebrationScreen
              professionalName={formData.professionalName}
              whatsappNumber={formData.whatsappNumber}
              procedureName={formData.procedureName}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
