'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import axiosInstance from '@/utils/apiClient';

type ChangeType = 'email' | 'mobile' | 'both';
type Step = 'choose' | 'details' | 'verify';

interface ChangeCredentialModalProps {
  closeModal: () => void;
  onSuccessLogout: (message: string) => void;
}

export default function ChangeCredentialModal({
  closeModal,
  onSuccessLogout,
}: ChangeCredentialModalProps) {
  const [step, setStep] = useState<Step>('choose');
  const [changeType, setChangeType] = useState<ChangeType>('email');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (timer <= 0) return undefined;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const clearFeedback = () => {
    setError('');
    setMessage('');
  };

  const startFlow = async () => {
    clearFeedback();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/contact-change/init', {
        change_type: changeType,
      });
      const payload = response.data?.data || {};
      setRecoveryToken(payload.recovery_token || '');
      setMaskedEmail(payload.masked_email || '');
      setMaskedMobile(payload.masked_mobile || '');
      setIsFirstLogin(!!payload.is_first_login);
      setStep('details');
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.detail ||
          requestError?.response?.data?.message ||
          'Unable to start the credential change flow.'
      );
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    clearFeedback();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/contact-change/request-otp', {
        recovery_token: recoveryToken,
        new_email: changeType === 'email' || changeType === 'both' ? newEmail || null : null,
        new_mobile: changeType === 'mobile' || changeType === 'both' ? newMobile || null : null,
      });
      setMessage(response.data?.message || 'OTP sent successfully.');
      setStep('verify');
      setTimer(60);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.detail ||
          requestError?.response?.data?.message ||
          'Unable to send OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmChange = async () => {
    clearFeedback();
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/contact-change/confirm', {
        recovery_token: recoveryToken,
        otp,
      });
      onSuccessLogout(response.data?.message || 'Credential change completed successfully. Please sign in again.');
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.detail ||
          requestError?.response?.data?.message ||
          'Unable to verify OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    await requestOtp();
  };

  const renderAlert = () => (
    <>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && !error && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
          <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </>
  );

  return (
    <Dialog open onClose={closeModal} className="relative z-[120]">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Change Credential</h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your registered email, mobile number, or both. After success, you must sign in again.
            </p>
          </div>

          <div className="space-y-4 px-6 py-5">
            {renderAlert()}

            {step === 'choose' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-indigo-700">
                    Maximum 2 changes per day
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                    Re-login required after update
                  </span>
                </div>
                <div>
                  <label htmlFor="change-type" className="block text-sm font-medium text-slate-700">
                    What do you want to change?
                  </label>
                  <select
                    id="change-type"
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value as ChangeType)}
                    className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="email">Email only</option>
                    <option value="mobile">Mobile only</option>
                    <option value="both">Email and mobile</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={startFlow}
                  disabled={loading}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Continue'}
                </button>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  You can change credentials up to 2 times per day. After a successful update, you must sign in again.
                </p>
                {(changeType === 'email' || changeType === 'both') && (
                  <>
                    <p className="text-xs text-slate-500">Current email: {maskedEmail || 'Not available'}</p>
                    <div>
                      <label htmlFor="new-email" className="block text-sm font-medium text-slate-700">
                        New Email
                      </label>
                      <input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value.toLowerCase())}
                        className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

                {(changeType === 'mobile' || changeType === 'both') && (
                  <>
                    <p className="text-xs text-slate-500">Current mobile: {maskedMobile || 'Not available'}</p>
                    <div>
                      <label htmlFor="new-mobile" className="block text-sm font-medium text-slate-700">
                        New Mobile
                      </label>
                      <input
                        id="new-mobile"
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={newMobile}
                        onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                        className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

                {isFirstLogin && (
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    First-time login user: if email changes, a new temporary password will be sent there.
                  </p>
                )}

                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={loading}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={confirmChange}
                  disabled={loading}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify and Update'}
                </button>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={timer > 0 || loading}
                  className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {timer > 0 ? `Send new OTP in ${timer}s` : 'Send new OTP'}
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
