'use client';

import { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import { useRouter } from 'next/navigation';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type ExecuteRecaptcha = ((action?: string) => Promise<string>) | undefined;
const ForgotPasswordComponent = ForgotPassword as any;

function ForgotPasswordPageContent({
  executeRecaptcha,
}: {
  executeRecaptcha?: ExecuteRecaptcha;
}) {
   const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'done' | 'contact-lookup' | 'contact-verify' | 'contact-otp' | 'contact-done'>('request');
  const router = useRouter(); // ✅ use client router
  const handleStepChange = (newStep: 'request' | 'verify' | 'reset' | 'done' | 'contact-lookup' | 'contact-verify' | 'contact-otp' | 'contact-done') => {

    setStep(newStep);
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <ForgotPasswordComponent
      step={step}
       mode="password"
        onStepChange={handleStepChange}
        onBackToLogin={handleBackToLogin}
        executeRecaptcha={executeRecaptcha}
      />
    </div>
  );
}

export default function Page() {
  if (!RECAPTCHA_SITE_KEY) {
    return <ForgotPasswordPageContent />;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <ForgotPasswordPageContentWithRecaptcha />
    </GoogleReCaptchaProvider>
  );
}

function ForgotPasswordPageContentWithRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  return <ForgotPasswordPageContent executeRecaptcha={executeRecaptcha} />;
}
