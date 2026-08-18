'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { CvHrdModal } from '@/components/CvHrdModal';

interface CvHrdFloatingCtaProps {
  onSelectService?: () => void;
}

export const CvHrdFloatingCta: React.FC<CvHrdFloatingCtaProps> = ({
  onSelectService,
}) => {
  // State System: 'default' (compact card), 'collapsed' (pill), 'hover' (expanded), 'hidden' (modal open)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSessionDismissed, setIsSessionDismissed] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Read session dismissal status on mount
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('cuti_cv_hrd_modal_dismissed') === 'true';
      if (dismissed) {
        setIsSessionDismissed(true);
        setIsCollapsed(true);
      }
    } catch {
      // Fallback if sessionStorage is disabled
    }
  }, []);

  // Helper to handle user editing/scrolling activity
  const handleUserActivity = useCallback(() => {
    // Immediately collapse CTA on edit/type/scroll
    setIsCollapsed(true);

    // Clear existing idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Set idle timer for 6 seconds of silence
    idleTimerRef.current = setTimeout(() => {
      // Check if input/textarea is currently focused
      const activeEl = document.activeElement;
      const isEditingInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.getAttribute('contenteditable') === 'true');

      // If user is not currently focusing an input and modal was not dismissed in this session, return to default compact card
      try {
        const dismissed = sessionStorage.getItem('cuti_cv_hrd_modal_dismissed') === 'true';
        if (!dismissed && !isEditingInput) {
          setIsCollapsed(false);
        }
      } catch {
        if (!isEditingInput) {
          setIsCollapsed(false);
        }
      }
    }, 6000);
  }, []);

  // Set up event listeners for input, keydown, focus, scroll
  useEffect(() => {
    const events = ['input', 'keydown', 'focusin', 'scroll', 'touchmove'];

    const listener = () => {
      handleUserActivity();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, listener, { capture: true, passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, listener, { capture: true });
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [handleUserActivity]);

  // Handle Mobile Virtual Keyboard detection
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        if (window.innerWidth < 1024) {
          setIsKeyboardOpen(true);
        }
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    const handleViewportResize = () => {
      if (window.visualViewport && window.innerWidth < 1024) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        if (keyboardHeight > 150) {
          setIsKeyboardOpen(true);
        } else {
          setIsKeyboardOpen(false);
        }
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSessionDismissed(true);
    setIsCollapsed(true);
    try {
      sessionStorage.setItem('cuti_cv_hrd_modal_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  // Determine current visual state
  // Modal open -> Hidden
  // Mobile keyboard active -> Hidden or highly minimal collapsed
  const isHidden = isModalOpen || isKeyboardOpen;
  const showCompactCard = (!isCollapsed || isHovered) && !isSessionDismissed;

  if (isHidden) {
    return (
      <CvHrdModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectService={onSelectService}
      />
    );
  }

  return (
    <>
      {/* Floating CTA Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed z-40 transition-all duration-200 ease-out right-4 bottom-4 md:right-6 md:bottom-6 pointer-events-auto select-none"
        style={{
          minWidth: 'fit-content',
        }}
      >
        {/* COMPACT CARD STATE (Default or Hover Expanded) */}
        {showCompactCard ? (
          <div className="relative w-[200px] md:w-[220px] p-3.5 rounded-[10px] bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-800 shadow-xl shadow-slate-950/25 backdrop-blur-md transition-all duration-200 ease-out animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300 shrink-0" />
                <span>Butuh bantuan CV?</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(true);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded-[10px] transition cursor-pointer"
                title="Kecilkan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-7 h-7 rounded-full border border-[#1738D1] overflow-hidden shrink-0 shadow-xs">
                <img
                  src="/images/mascot-1.webp"
                  alt="HR Recruiter"
                  className="w-full h-full object-cover scale-[2.1] origin-top translate-y-1"
                />
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-slate-900" />
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-snug">
                Dibuatkan oleh HRD profesional
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="w-full py-1.5 px-3 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>Buatkan CV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* COLLAPSED PILL STATE WITH CIRCULAR AVATAR IN CORNER */
          <button
            type="button"
            onClick={handleOpenModal}
            className="group relative flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-[10px] bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-800 hover:border-[#1738D1]/50 shadow-lg shadow-slate-950/20 backdrop-blur-md text-xs font-bold transition-all duration-200 ease-out cursor-pointer active:scale-95"
            title="Klik untuk info layanan CV by HRD"
          >
            {/* Gambar Lingkaran Avatar HRD */}
            <div className="relative w-8 h-8 rounded-full border-2 border-[#1738D1] overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <img
                src="/images/mascot-1.webp"
                alt="HR Specialist"
                className="w-full h-full object-cover scale-[2.1] origin-top translate-y-1"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900" />
            </div>
            <span className="text-slate-100 group-hover:text-white">CV by HRD</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Modal Dialog */}
      <CvHrdModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectService={onSelectService}
      />
    </>
  );
};
