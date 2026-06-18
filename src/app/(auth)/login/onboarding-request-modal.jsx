"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  ClipboardDocumentCheckIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import loginAxiosInstance from "@/utils/apiClient";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/serviceTypeUtils";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;
const ONBOARDING_PENDING_STORAGE_KEY = "onboarding_request_pending";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const initialFormData = {
  pen_number: "",
  dob: "",
  email: "",
  mobile_no: "",
  service_type_id: "",
};

const serviceTypes = [
  { value: "1", label: "IAS" },
  { value: "2", label: "IPS" },
  { value: "3", label: "IFS" },
];

const onboardingSteps = [
  {
    icon: ClipboardDocumentCheckIcon,
    accent: "text-blue-600 border-blue-500",
    dot: "bg-blue-500",
    title: "Enter your PEN, date of birth, registered contact details, and service type.",
  },
  {
    icon: DevicePhoneMobileIcon,
    accent: "text-emerald-600 border-emerald-500",
    dot: "bg-emerald-500",
    title: "Your contact details will be verified using OTP-based authentication.",
  },
  {
    icon: PaperAirplaneIcon,
    accent: "text-amber-500 border-amber-400",
    dot: "bg-amber-400",
    title: "Verification happens through your registered email address and mobile number.",
  },
  {
    icon: UserCircleIcon,
    accent: "text-violet-600 border-violet-500",
    dot: "bg-violet-500",
    title: "After verification, the onboarding request is submitted for approval.",
  },
];

export default function OnboardingRequestModal({ open = false, onClose, executeRecaptcha = null }) {
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [otpExpiryLabel, setOtpExpiryLabel] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const otpInputsRef = useRef([]);

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);
  const maxDob = useMemo(() => {
    const today = new Date();
    const limit = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return limit.toISOString().split("T")[0];
  }, []);

  const getRecaptchaToken = async (action) => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured.");
      return null;
    }

    if (!executeRecaptcha) {
      throw new Error("reCAPTCHA is still loading. Please try again.");
    }

    return executeRecaptcha(action);
  };

  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setErrors({});

    const pendingRequest = sessionStorage.getItem(ONBOARDING_PENDING_STORAGE_KEY);
    if (pendingRequest) {
      try {
        const parsed = JSON.parse(pendingRequest);
        setFormData(parsed.formData || initialFormData);
        setRequestId(parsed.requestId || null);
        setStep(parsed.requestId ? "verify" : "details");
        setOtpExpiryLabel(parsed.otpExpiryLabel || "OTP has been sent to your email and mobile number.");
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setResendCooldown(parsed.resendCooldown || 0);
        setConsentChecked(Boolean(parsed.consentChecked));
        return;
      } catch {
        sessionStorage.removeItem(ONBOARDING_PENDING_STORAGE_KEY);
      }
    }

    setStep("details");
    setRequestId(null);
    setOtpExpiryLabel("");
    setResendCooldown(0);
    setFormData(initialFormData);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setConsentChecked(false);
  }, [open]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!requestId || step !== "verify") return;
    sessionStorage.setItem(
      ONBOARDING_PENDING_STORAGE_KEY,
      JSON.stringify({
        requestId,
        formData,
        otpExpiryLabel,
        resendCooldown,
        consentChecked,
      })
    );
  }, [requestId, formData, otpExpiryLabel, resendCooldown, consentChecked, step]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "pen_number") {
      nextValue = value.replace(/\D/g, "").slice(0, 7);
    }

    if (name === "mobile_no") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "email") {
      nextValue = value.toLowerCase().trimStart();
    }

    setFormData((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateDetails = () => {
    const nextErrors = {};
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!/^\d{6,7}$/.test(formData.pen_number)) {
      nextErrors.pen_number = "PEN must be 6 to 7 digits.";
    }

    if (!formData.dob) {
      nextErrors.dob = "Date of birth is required.";
    } else {
      const today = new Date();
      const dobDate = new Date(`${formData.dob}T00:00:00`);
      const eligibilityDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

      if (Number.isNaN(dobDate.getTime())) {
        nextErrors.dob = "Enter a valid date of birth.";
      } else if (dobDate > eligibilityDate) {
        nextErrors.dob = "You must be at least 18 years old to request onboarding.";
      }
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile_no)) {
      nextErrors.mobile_no = "Mobile number must be 10 digits and start with 6, 7, 8, or 9.";
    }

    if (!formData.service_type_id) {
      nextErrors.service_type_id = "Service type is required.";
    }

    if (!consentChecked) {
      nextErrors.consent = "Please confirm the declaration before proceeding.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/\D/g, "");
    const digit = sanitized ? sanitized[sanitized.length - 1] : "";

    setOtpDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    setOtpDigits(Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] || ""));
    otpInputsRef.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const requestOtp = async (action = "send") => {
    if (!validateDetails()) return;

    try {
      setLoading(true);
      toast.loading(action === "resend" ? "Resending OTP..." : "Sending OTP...", {
        id: "onboarding-request-otp",
      });

      const recaptchaAction = action === "resend" ? "onboarding_request_otp_resend" : "onboarding_request_otp_request";
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);
      const payload = {
        ...formData,
        service_type_id: Number(formData.service_type_id),
        action,
      };

      if (recaptchaToken) {
        payload.recaptcha_token = recaptchaToken;
        payload.recaptcha_action = recaptchaAction;
      }

      const response = await loginAxiosInstance.post("/auth/onboarding-request/request-otp", payload);

      toast.dismiss("onboarding-request-otp");
      const responsePayload = response.data?.data || {};
      setRequestId(responsePayload.request_id);
      setStep("verify");
      setResendCooldown(RESEND_COOLDOWN_SEC);
      setOtpExpiryLabel(responsePayload.otp_expires_at ? "OTP has been sent to your email and mobile number." : "");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      window.setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
      toast.success(response.data?.detail || "OTP sent successfully.");
    } catch (error) {
      toast.dismiss("onboarding-request-otp");
      toast.error(extractErrorMessage(error) || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otpValue.length !== OTP_LENGTH) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Verifying OTP...", { id: "onboarding-verify-otp" });
      const recaptchaAction = "onboarding_request_otp_verify";
      const recaptchaToken = await getRecaptchaToken(recaptchaAction);

      const payload = {
        request_id: requestId,
        otp: otpValue,
      };

      if (recaptchaToken) {
        payload.recaptcha_token = recaptchaToken;
        payload.recaptcha_action = recaptchaAction;
      }

      const response = await loginAxiosInstance.post("/auth/onboarding-request/verify-otp", payload);

      toast.dismiss("onboarding-verify-otp");
      sessionStorage.removeItem(ONBOARDING_PENDING_STORAGE_KEY);
      toast.success(response.data?.detail || "Onboarding request submitted successfully.");
      onClose();
    } catch (error) {
      toast.dismiss("onboarding-verify-otp");
      const message = extractErrorMessage(error) || "OTP verification failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    sessionStorage.removeItem(ONBOARDING_PENDING_STORAGE_KEY);
    setStep("details");
    setLoading(false);
    setErrors({});
    setRequestId(null);
    setOtpExpiryLabel("");
    setResendCooldown(0);
    setFormData(initialFormData);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setConsentChecked(false);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" />
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-3">
          <DialogPanel className="relative w-full max-w-[660px] rounded-[20px] bg-white p-4 shadow-2xl transition-all dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="pr-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
              Sign Up
              </p>
            </div>

            {step === "details" ? (
              <div className="mt-4 space-y-3.5">
                <div className="space-y-2.5">
                  <div className="px-4">
                    <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-x-2 sm:gap-x-3">
                      {onboardingSteps.map((stepItem, index) => {
                        const StepIcon = stepItem.icon;
                        return (
                          <div key={`onboarding-step-${index}`} className="contents">
                            <div className="group relative flex flex-col items-center">
                              <button
                                type="button"
                                className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white ${stepItem.accent}`}
                                title={stepItem.title}
                                aria-label={stepItem.title}
                              >
                                <StepIcon className="h-5 w-5" />
                              </button>
                              <div className={`mt-1.5 h-2 w-2 rounded-full ${stepItem.dot}`} />
                              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-52 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-center text-xs font-medium leading-5 text-white shadow-xl group-hover:block">
                                {stepItem.title}
                              </div>
                            </div>
                            {index < onboardingSteps.length - 1 ? (
                              <div className="mb-3.5 h-px bg-slate-300" />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                   This onboarding request form is applicable only for the All India Service Officers (IAS, IPS, IFS) of Kerala Cadre.
                  </p>
                </div>

                <div className="rounded-[26px] border border-indigo-100 bg-[linear-gradient(180deg,rgba(238,244,255,0.88),rgba(255,255,255,0.98))] px-4 py-3.5 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/20">
              
                  <div className="grid gap-x-4 gap-y-2.5 md:grid-cols-2">
                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-200">
                        PEN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pen_number"
                        value={formData.pen_number}
                        onChange={handleFormChange}
                        maxLength={7}
                        className="mt-1.5 block h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter 6-7 digit PEN"
                      />
                      {errors.pen_number ? <p className="mt-1 text-sm text-red-600">{errors.pen_number}</p> : null}
                    </div>

                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-200">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleFormChange}
                        max={maxDob}
                        className="mt-1.5 block h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      {errors.dob ? <p className="mt-1 text-sm text-red-600">{errors.dob}</p> : null}
                    </div>

                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-200">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="mt-1.5 block h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter your registered email address"
                      />
                      {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
                    </div>

                    <div>
                      <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-200">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile_no"
                        value={formData.mobile_no}
                        onChange={handleFormChange}
                        maxLength={10}
                        className="mt-1.5 block h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter your registered 10-digit mobile number"
                      />
                      {errors.mobile_no ? <p className="mt-1 text-sm text-red-600">{errors.mobile_no}</p> : null}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-200">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="service_type_id"
                      value={formData.service_type_id}
                      onChange={handleFormChange}
                      className="mt-1.5 block h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Select Service Type</option>
                      {serviceTypes.map((serviceType) => (
                        <option key={serviceType.value} value={serviceType.value}>
                          {serviceType.label}
                        </option>
                      ))}
                    </select>
                    {errors.service_type_id ? <p className="mt-1 text-sm text-red-600">{errors.service_type_id}</p> : null}
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.98))] px-4 py-3.5 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-white">
                    Declaration and Consent <span className="text-red-500">*</span>
                  </p>
                  <label className="mt-2.5 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(event) => {
                        setConsentChecked(event.target.checked);
                        setErrors((current) => ({ ...current, consent: "" }));
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[12.5px] leading-5">
                      <p>I hereby declare that the PEN, Date of Birth, email address, mobile number, and service type provided above belong to me and are true to the best of my knowledge as an AIS Officer of the Kerala Cadre.</p>
                      <p> I consent to the use of these details in the KARMASRI Portal for onboarding verification, account creation, related services, and official communication, subject to approval by the competent authority.</p>
                      <p> I understand that any false, incorrect, or misleading information may invite action under applicable laws, rules, and regulations.</p>
                     </span>
                  </label>
                  {errors.consent ? <p className="mt-2 text-sm text-red-600">{errors.consent}</p> : null}
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => requestOtp("send")}
                    className="rounded-xl bg-primary-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              </div>
            ) : step === "verify" ? (
              <div className="mt-5 space-y-3.5">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-900">
                  {otpExpiryLabel || "OTP has been sent to your email and mobile number."}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/80">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">OTP</label>
                  <div className="mt-2 flex gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={`otp-${index}`}
                        ref={(element) => {
                          otpInputsRef.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={handleOtpPaste}
                        className="h-10 w-9 rounded-xl border border-gray-300 text-center text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Use the same 6-digit OTP received in your email and mobile number to continue the onboarding request.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                    disabled={loading}
                  >
                    Start over
                  </button>
                  <button
                    type="button"
                    onClick={() => requestOtp("resend")}
                    className="font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Verify & Submit Request"}
                  </button>
                </div>
              </div>
            ) : null}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
