'use client';

import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { axiosInstance } from '@/utils/apiClient';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const validatePassword = (password) => {
  const validations = [
    { test: password.length >= 8, message: 'At least 8 characters' },
    { test: password.length <= 20, message: 'Must not exceed 20 characters' },
    { test: /[A-Z]/.test(password), message: 'One uppercase letter' },
    { test: /[a-z]/.test(password), message: 'One lowercase letter' },
    { test: /\d/.test(password), message: 'One number' },
    { test: /[@$!%*?&]/.test(password), message: 'One special character (@, $, !, %, *, ?, &)' },
  ];
  return validations.filter((v) => !v.test).map((v) => v.message);
};

const isValidPen = (input) => /^\d{6,7}$/.test(input);
const isValidMobile = (input) => /^[6-9]\d{9}$/.test(input);
const isValidDob = (input) => {
  if (!input) return false;
  const dob = new Date(`${input}T00:00:00`);
  const today = new Date();
  if (Number.isNaN(dob.getTime())) return false;
  return dob <= today;
};

const initialContactState = {
  penNumber: '',
  dob: '',
  changeType: 'email',
  currentEmail: '',
  currentMobile: '',
  newEmail: '',
  newMobile: '',
  maskedEmail: '',
  maskedMobile: '',
  recoveryToken: '',
  isFirstLogin: false,
};

export default function ForgotPassword({
  step,
  mode = 'password',
  onStepChange,
  onBackToLogin,
  executeRecaptcha = null,
  backLabel = 'Back to Login',
  showBackButton = true,
}) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [contactFlow, setContactFlow] = useState(initialContactState);
  const [showContactLookupNotice, setShowContactLookupNotice] = useState(true);
  const [showContactVerifyNotice, setShowContactVerifyNotice] = useState(true);

  const clearFeedback = () => {
    setError(null);
    setMessage('');
  };

  useEffect(() => {
    clearFeedback();
    setOtp('');
    setTimer(0);
    setPasswordErrors([]);
    if (mode === 'contact') {
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('reset_token');
      setContactFlow(initialContactState);
      setShowContactLookupNotice(true);
      setShowContactVerifyNotice(true);
    } else {
      setContactFlow(initialContactState);
    }
  }, [mode]);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const isValidEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  const getRecaptchaToken = async (action) => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured.');
      return null;
    }

    if (!executeRecaptcha) {
      throw new Error('reCAPTCHA is still loading. Please try again.');
    }

    return executeRecaptcha(action);
  };

  const showMessage = (nextMessage, isError = false) => {
    if (isError) {
      setError(nextMessage);
      setMessage('');
    } else {
      setMessage(nextMessage);
      setError(null);
    }
  };

  const handleEmailSubmit = async () => {
    setLoading(true);
    clearFeedback();

    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address.', true);
      setLoading(false);
      return;
    }

    try {
      const recaptchaAction = 'forgot_password_request';
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const { data } = await axiosInstance.post('/auth/forgot-password', {
        email: email.toLowerCase(),
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
      });
      showMessage(data?.message || 'OTP has been sent to your email.');
      onStepChange('verify');
      setTimer(60);
    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Something went wrong. Please try again.';
      showMessage(backendMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setLoading(true);
    clearFeedback();

    if (!/^\d{6}$/.test(otp)) {
      showMessage('OTP must be exactly 6 digits.', true);
      setLoading(false);
      return;
    }

    try {
      const recaptchaAction = 'forgot_password_otp_verify';
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const response = await axiosInstance.post('/auth/password-reset-otp', {
        email,
        otp,
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
      });
    
      if (response.status === 200) {
        const token = response.data?.data?.token;
        sessionStorage.setItem('reset_token', token);
        sessionStorage.setItem('email', email);
        onStepChange('reset');
      }
    } catch (submitError) {
      const backendError =
        submitError?.response?.data?.detail ||
        submitError?.response?.data?.message ||
        'Something went wrong. Please try again.';
      showMessage(backendError, true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    clearFeedback();

    const storedEmail = sessionStorage.getItem('email');
    const resetToken = sessionStorage.getItem('reset_token');
    const validationErrors = [];

    if (!newPassword || !confirmPassword) {
      validationErrors.push('Please fill in all required fields.');
    }

    if (/\s/.test(newPassword) || /\s/.test(confirmPassword)) {
      validationErrors.push('Passwords must not contain spaces.');
    }

    if (validationErrors.length === 0 && newPassword !== confirmPassword) {
      validationErrors.push('Passwords do not match.');
    }

    if (validationErrors.length === 0 && newPassword === confirmPassword) {
      validationErrors.push(...validatePassword(newPassword));
    }

    if (validationErrors.length > 0) {
      setPasswordErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const recaptchaAction = 'password_reset_confirm';
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const response = await axiosInstance.post('/auth/password-reset-confirm', {
        token: resetToken,
        email: storedEmail,
        new_password: newPassword,
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
      });

      if (response?.status === 200) {
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('reset_token');
        onStepChange('done');
      } else {
        showMessage('Failed to reset password. Please try again.', true);
      }
    } catch (submitError) {
      const backendMessage =
        submitError?.response?.data?.detail ||
        submitError?.response?.data?.message ||
        'Something went wrong. Please try again.';
      showMessage(backendMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    await handleEmailSubmit();
  };

  const handleContactLookup = async () => {
    setLoading(true);
    clearFeedback();

    if (!contactFlow.penNumber || !contactFlow.dob) {
      showMessage('Please enter PEN and Date Of Birth.', true);
      setLoading(false);
      return;
    }

    if (!isValidPen(contactFlow.penNumber)) {
      showMessage('PEN must be 6 to 7 digits.', true);
      setLoading(false);
      return;
    }

    if (!isValidDob(contactFlow.dob)) {
      showMessage('Please enter a valid Date Of Birth.', true);
      setLoading(false);
      return;
    }

    try {
      const recaptchaAction = 'contact_reset_lookup';
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const response = await axiosInstance.post('/auth/recovery/contact-reset/lookup', {
        pen_number: contactFlow.penNumber,
        dob: contactFlow.dob,
        change_type: contactFlow.changeType,
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
      });
      const payload = response?.data?.data || {};
      setContactFlow((prev) => ({
        ...prev,
        recoveryToken: payload.recovery_token || '',
        maskedEmail: payload.masked_email || '',
        maskedMobile: payload.masked_mobile || '',
        isFirstLogin: !!payload.is_first_login,
      }));
      onStepChange('contact-verify');
    } catch (lookupError) {
      const backendMessage =
        lookupError?.response?.data?.detail ||
        lookupError?.response?.data?.message ||
        'Unable to verify PEN and Date Of Birth.';
      showMessage(backendMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const sendContactOtp = async () => {
    setLoading(true);
    clearFeedback();

    const needsEmail = contactFlow.changeType === 'email' || contactFlow.changeType === 'both';
    const needsMobile = contactFlow.changeType === 'mobile' || contactFlow.changeType === 'both';

    if (needsEmail) {
      if (!contactFlow.currentEmail || !contactFlow.newEmail) {
        showMessage('Please enter both current and new email address.', true);
        setLoading(false);
        return;
      }
      if (!isValidEmail(contactFlow.currentEmail) || !isValidEmail(contactFlow.newEmail)) {
        showMessage('Please enter valid email address values.', true);
        setLoading(false);
        return;
      }
      if (contactFlow.currentEmail === contactFlow.newEmail) {
        showMessage('The new email must be different from the current email.', true);
        setLoading(false);
        return;
      }
    }

    if (needsMobile) {
      if (!contactFlow.currentMobile || !contactFlow.newMobile) {
        showMessage('Please enter both current and new mobile number.', true);
        setLoading(false);
        return;
      }
      if (!isValidMobile(contactFlow.currentMobile) || !isValidMobile(contactFlow.newMobile)) {
        showMessage('Mobile number must be 10 digits and start with 6, 7, 8, or 9.', true);
        setLoading(false);
        return;
      }
      if (contactFlow.currentMobile === contactFlow.newMobile) {
        showMessage('The new mobile number must be different from the current mobile number.', true);
        setLoading(false);
        return;
      }
    }

    try {
      const recaptchaAction = 'contact_reset_request_otp';
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const response = await axiosInstance.post('/auth/recovery/contact-reset/request-otp', {
        recovery_token: contactFlow.recoveryToken,
        current_email: contactFlow.changeType === 'email' || contactFlow.changeType === 'both' ? contactFlow.currentEmail : null,
        current_mobile: contactFlow.changeType === 'mobile' || contactFlow.changeType === 'both' ? contactFlow.currentMobile : null,
        new_email: contactFlow.changeType === 'email' || contactFlow.changeType === 'both' ? contactFlow.newEmail : null,
        new_mobile: contactFlow.changeType === 'mobile' || contactFlow.changeType === 'both' ? contactFlow.newMobile : null,
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
      });
      showMessage(response?.data?.message || 'OTP Sent Successfully.');
      onStepChange('contact-otp');
      setTimer(60);
    } catch (requestError) {
      const backendMessage =
        requestError?.response?.data?.detail ||
        requestError?.response?.data?.message ||
        'Unable to send OTP. Please try again.';
      showMessage(backendMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const handleContactConfirm = async () => {
    setLoading(true);
    clearFeedback();

    if (!/^\d{6}$/.test(otp)) {
      showMessage('OTP must be exactly 6 digits.', true);
      setLoading(false);
      return;
    }

    try {
      const recaptchaAction = 'contact_reset_confirm';
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const response = await axiosInstance.post('/auth/recovery/contact-reset/confirm', {
        recovery_token: contactFlow.recoveryToken,
        otp,
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
      });
      onStepChange('contact-done');
    } catch (confirmError) {
      const backendMessage =
        confirmError?.response?.data?.detail ||
        confirmError?.response?.data?.message ||
        'Unable to verify OTP. Please try again.';
      showMessage(backendMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordFlow = () => (
    <>
      {step === 'request' && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              Enter your Email ID
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder:text-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            onClick={handleEmailSubmit}
            disabled={loading || timer > 0}
            className="mt-4 w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? 'Sending OTP...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              Enter OTP
            </label>
            <div className="mt-2">
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder:text-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            onClick={handleOtpSubmit}
            disabled={loading}
            className="mt-4 w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? 'Verifying OTP...' : 'Verify OTP'}
          </button>
          {timer === 0 ? (
            <p className="mt-4 cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300" onClick={handleResendOtp}>
              Resend OTP
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Resend OTP in {timer}s</p>
          )}
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              New Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="block w-full rounded-md border-0 py-1.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm mb-4 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onContextMenu={(e) => e.preventDefault()}
                className="block w-full mb-3 rounded-md border-0 py-1.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {passwordErrors.length > 0 && (
            <ul className="mb-4 list-disc list-inside text-sm text-red-500 dark:text-red-400">
              {passwordErrors.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            onClick={handlePasswordReset}
            disabled={loading}
            className="mt-3 w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center justify-center text-center">
          <CheckCircleIcon className="mb-2 h-12 w-12 text-green-600 dark:text-green-500" />
          <p className="mb-6 text-green-600 dark:text-green-500">Password has been reset successfully.</p>
        </div>
      )}
    </>
  );

  const renderContactFlow = () => (
    <>
      {step === 'contact-lookup' && (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {showContactLookupNotice && (
            <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-100">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1 space-y-1">
                <p>Enter your PEN and Date Of Birth, then choose whether you want to change email, mobile, or both.</p>
                <span className="inline-flex rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-orange-700 dark:border-orange-800/60 dark:bg-orange-900/40 dark:text-orange-200">
                  Max 2 attempts per day.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowContactLookupNotice(false)}
                className="rounded-full p-1 text-orange-700 transition hover:bg-orange-100 hover:text-orange-900 dark:text-orange-200 dark:hover:bg-orange-900/40 dark:hover:text-white"
                aria-label="Dismiss information"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          <div>
            <label htmlFor="pen-number" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              PEN
            </label>
            <input
              id="pen-number"
              type="text"
              inputMode="numeric"
              maxLength={7}
              value={contactFlow.penNumber}
              onChange={(e) => setContactFlow((prev) => ({ ...prev, penNumber: e.target.value.replace(/\D/g, '') }))}
              className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              Date Of Birth
            </label>
            <input
              id="dob"
              type="date"
              value={contactFlow.dob}
              onChange={(e) => setContactFlow((prev) => ({ ...prev, dob: e.target.value }))}
              className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              What do you want to change?
            </label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { value: 'email', label: 'Email only' },
                { value: 'mobile', label: 'Mobile only' },
                { value: 'both', label: 'Email and mobile' },
              ].map((option) => {
                const active = contactFlow.changeType === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                      active
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="change-type"
                      value={option.value}
                      checked={active}
                      onChange={(e) => setContactFlow((prev) => ({ ...prev, changeType: e.target.value }))}
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            onClick={handleContactLookup}
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? 'Checking...' : 'Verify & Proceed'}
          </button>
        </form>
      )}

      {step === 'contact-verify' && (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {showContactVerifyNotice && (
            <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-100">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1 space-y-1">
                <p>Enter the current registered details matching the masked values below, then provide the new details.</p>
                <span className="inline-flex rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-orange-700 dark:border-orange-800/60 dark:bg-orange-900/40 dark:text-orange-200">
                  Max 2 attempts per day.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowContactVerifyNotice(false)}
                className="rounded-full p-1 text-orange-700 transition hover:bg-orange-100 hover:text-orange-900 dark:text-orange-200 dark:hover:bg-orange-900/40 dark:hover:text-white"
                aria-label="Dismiss information"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {(contactFlow.changeType === 'email' || contactFlow.changeType === 'both') && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">Registered email: {contactFlow.maskedEmail || 'Not available'}</p>
              <div>
                <label htmlFor="current-email" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                  Current Email
                </label>
                <input
                  id="current-email"
                  type="email"
                  value={contactFlow.currentEmail}
                  onChange={(e) => setContactFlow((prev) => ({ ...prev, currentEmail: e.target.value.toLowerCase() }))}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                  New Email
                </label>
                <input
                  id="new-email"
                  type="email"
                  value={contactFlow.newEmail}
                  onChange={(e) => setContactFlow((prev) => ({ ...prev, newEmail: e.target.value.toLowerCase() }))}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>
            </>
          )}

          {(contactFlow.changeType === 'mobile' || contactFlow.changeType === 'both') && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">Registered mobile: {contactFlow.maskedMobile || 'Not available'}</p>
              <div>
                <label htmlFor="current-mobile" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                  Current Mobile
                </label>
                <input
                  id="current-mobile"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={contactFlow.currentMobile}
                  onChange={(e) => setContactFlow((prev) => ({ ...prev, currentMobile: e.target.value.replace(/\D/g, '') }))}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>
              <div>
                <label htmlFor="new-mobile" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
                  New Mobile
                </label>
                <input
                  id="new-mobile"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={contactFlow.newMobile}
                  onChange={(e) => setContactFlow((prev) => ({ ...prev, newMobile: e.target.value.replace(/\D/g, '') }))}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>
            </>
          )}

          {contactFlow.isFirstLogin && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-200">
              Upon successful verification, login credentials will be sent to the user's registered email address for first-time login.
            </p>
          )}

          <button
            type="submit"
            onClick={sendContactOtp}
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'contact-otp' && (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Enter the OTP sent to the new contact details you provided to complete the change request.
          </p>
          <div>
            <label htmlFor="contact-otp" className="block text-sm font-medium text-gray-500 dark:text-gray-300">
              OTP
            </label>
            <input
              id="contact-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            />
          </div>
          <button
            type="submit"
            onClick={handleContactConfirm}
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? 'Verifying OTP...' : 'Verify and Update'}
          </button>
          {timer === 0 ? (
            <button
              type="button"
              onClick={sendContactOtp}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Send new OTP
            </button>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">New OTP can be sent in {timer}s</p>
          )}
        </form>
      )}

      {step === 'contact-done' && (
        <div className="flex flex-col items-center justify-center text-center">
          <CheckCircleIcon className="mb-2 h-12 w-12 text-green-600 dark:text-green-500" />
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {contactFlow.isFirstLogin
              ? 'Your account has been successfully verified. Login credentials have been sent to your registered email address. Please check your inbox to access the KARMASRI portal.'
              : 'You can continue signing in with your existing password and the updated contact details.'}
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && !error && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {mode === 'contact' ? renderContactFlow() : renderPasswordFlow()}

      {showBackButton && (
        <div className="flex justify-end">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/50 dark:hover:text-white"
          >
            {backLabel}
          </button>
        </div>
      )}
    </div>
  );
}
