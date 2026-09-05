import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminBaseUrl } from '../../utils/env';

interface PreRegisterFormProps {
  apiBaseUrl?: string;
}

export default function PreRegisterForm({ apiBaseUrl }: PreRegisterFormProps) {
  // Step 1: WhatsApp Number -> Step 2: Name
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredName, setRegisteredName] = useState('');
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [isExisting, setIsExisting] = useState(false);

  // Advance from Step 1 (WhatsApp) to Step 2 (Name)
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.trim();
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || digitsOnly.length < 8) {
      setErrorMessage('Please enter a valid WhatsApp number.');
      return;
    }

    setStep(2);
  };

  // Submit Step 2 (Name + stored WhatsApp)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage('Please tell us what we should call you.');
      return;
    }

    setStatus('loading');

    try {
      const baseUrl = apiBaseUrl || getAdminBaseUrl();
      const endpoint = `${baseUrl}/api/pre-register`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: cleanName,
          phone_number: cleanPhone,
          role_status: 'EARLY_TESTER',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRegisteredName(cleanName);
        setRegisteredPhone(cleanPhone);
        setIsExisting(result.isExisting || false);
        setStatus('success');
      } else {
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
        setStatus('idle');
      }
    } catch (err) {
      console.error('Error submitting waitlist:', err);
      setErrorMessage('Terjadi kendala jaringan saat mendaftar. Silakan coba beberapa saat lagi.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setStep(1);
    setPhone('');
    setName('');
    setStatus('idle');
    setErrorMessage('');
  };

  const inputResetStyle: React.CSSProperties = {
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    outline: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    backgroundColor: 'transparent',
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="max-w-lg w-full rounded-2xl border border-blue-500/40 bg-black/60 backdrop-blur-xl p-5 sm:p-6 text-white shadow-2xl space-y-3.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#1738D1]/25 border border-[#1738D1]/50 flex items-center justify-center text-blue-400 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {isExisting ? "You're Already on the List!" : `Welcome aboard, ${registeredName || 'Friend'}!`}
                </h3>
                <p className="text-xs text-white/75 mt-0.5 leading-relaxed">
                  We'll notify you on WhatsApp (<strong className="text-white font-medium">{registeredPhone}</strong>) when early access opens.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="text-white/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>Early Access Slot Reserved</span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer"
              >
                Register another
              </button>
            </div>
          </motion.div>
        ) : step === 1 ? (
          /* STEP 1: WhatsApp Number Question (1 Line) */
          <motion.div
            key="step-phone"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            <form
              onSubmit={handleNextStep}
              className="relative max-w-lg w-full"
            >
              <div className="relative flex items-end gap-3 sm:gap-4 pb-2">
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    pattern="[0-9+ ]*"
                    autoFocus
                    value={phone}
                    onChange={(e) => {
                      // Allow only digits, '+' at start, and clean phone characters
                      const val = e.target.value;
                      const sanitized = val.replace(/[^0-9+]/g, '');
                      // Only allow '+' if it is the very first character
                      const clean = sanitized.startsWith('+')
                        ? '+' + sanitized.slice(1).replace(/\+/g, '')
                        : sanitized.replace(/\+/g, '');
                      setPhone(clean);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="May I have your WhatsApp number?"
                    required
                    style={inputResetStyle}
                    className={`w-full text-base sm:text-lg font-medium py-2 bg-transparent border-b-2 text-white placeholder:text-white/40 focus:outline-none transition ${
                      phone.trim()
                        ? 'border-emerald-400'
                        : 'border-white/30 focus:border-[#1738D1]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-[#1738D1] hover:bg-[#132ea8] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2 shrink-0 transition duration-150 shadow-lg shadow-[#1738D1]/30 cursor-pointer mb-0.5"
                >
                  <span>Continue</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>

              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-rose-400 mt-1 font-medium"
                >
                  {errorMessage}
                </motion.p>
              )}
            </form>
          </motion.div>
        ) : (
          /* STEP 2: Name Question (1 Line) */
          <motion.div
            key="step-name"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="relative max-w-lg w-full"
            >
              <div className="relative flex items-end gap-3 sm:gap-4 pb-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="What should I call you?"
                    required
                    style={inputResetStyle}
                    className={`w-full text-base sm:text-lg font-medium py-2 bg-transparent border-b-2 text-white placeholder:text-white/40 focus:outline-none transition ${
                      name.trim()
                        ? 'border-emerald-400'
                        : 'border-white/30 focus:border-[#1738D1]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-full bg-[#1738D1] hover:bg-[#132ea8] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2 shrink-0 transition duration-150 shadow-lg shadow-[#1738D1]/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mb-0.5"
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Join waitlist</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-1">
                {errorMessage ? (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-400 font-medium"
                  >
                    {errorMessage}
                  </motion.p>
                ) : (
                  <span className="text-[11px] text-white/40">
                    WA: {phone}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-white/50 hover:text-white underline transition cursor-pointer ml-auto"
                >
                  Change number
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
