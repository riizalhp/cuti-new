'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const TOUR_STORAGE_KEY = 'employr_product_tour_completed_v1';

let activeDriver: Driver | null = null;

export const TOUR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="tour-beranda"]',
    popover: {
      title: 'Beranda',
      description: 'Pusat ringkasan progres kariermu, status kesiapan kerja, serta agenda aksi prioritas harian.',
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tour-cv"]',
    popover: {
      title: 'CV Saya',
      description: 'Susun dan perbaiki CV standar ATS, analisis kata kunci industri, serta tingkatkan peluang lolos screening.',
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tour-tracker"]',
    popover: {
      title: 'Tracker Lamaran',
      description: 'Kelola seluruh tahapan lamaran secara rapi dari status Terkirim, Screening, hingga Interview.',
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tour-loker"]',
    popover: {
      title: 'Loker',
      description: 'Eksplorasi lowongan kerja terverifikasi dan masukkan langsung ke tracker lamaranmu dalam satu klik.',
      side: 'right',
      align: 'center',
    },
  },
];

export function stopProductTour() {
  if (activeDriver) {
    try {
      activeDriver.destroy();
    } catch {
      // Ignore destroy errors
    }
    activeDriver = null;
  }
}

function syncDriverPopoverPosition() {
  if (typeof window === 'undefined') return;

  const popoverEl = document.querySelector('.driver-popover') as HTMLElement | null;
  const activeEl = document.querySelector('.driver-active-element') as HTMLElement | null;
  if (!popoverEl || !activeEl) return;

  const isDesktop = window.innerWidth >= 768;
  const isZoomed = window.innerWidth >= 1024;
  const zoomFactor = isZoomed ? 0.8 : 1.0;

  const elRect = activeEl.getBoundingClientRect();
  const popRect = popoverEl.getBoundingClientRect();

  if (!isDesktop) {
    // Mobile / Tablet Portrait: Popover positioned with safe margin clamping
    const isLowerHalf = elRect.top > window.innerHeight / 2;
    const popoverWidth = popRect.width || Math.min(320, window.innerWidth - 32);

    const targetCenterX = elRect.left + elRect.width / 2;
    let targetLeft = targetCenterX - popoverWidth / 2;
    targetLeft = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, targetLeft));

    let targetTop = isLowerHalf
      ? elRect.top - popRect.height - 12
      : elRect.bottom + 12;

    // Ensure within vertical viewport bounds
    targetTop = Math.max(12, Math.min(window.innerHeight - popRect.height - 12, targetTop));

    const deltaX = targetLeft - popRect.left;
    const deltaY = targetTop - popRect.top;

    if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
      const currLeft = parseFloat(popoverEl.style.left) || popRect.left;
      const currTop = parseFloat(popoverEl.style.top) || popRect.top;

      popoverEl.style.left = `${currLeft + deltaX}px`;
      popoverEl.style.top = `${currTop + deltaY}px`;
    }
  } else {
    // Desktop: popover placed on the right of the Sidebar button
    // Target visual X: exactly 14px to the right of the active button's border
    const targetScreenLeft = elRect.right + 14;
    const deltaX = targetScreenLeft - popRect.left;

    // Target visual Y: vertically centered with the active button
    const targetScreenCenterY = elRect.top + elRect.height / 2;
    const currentScreenCenterY = popRect.top + popRect.height / 2;
    const deltaY = targetScreenCenterY - currentScreenCenterY;

    if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
      const currLeft = parseFloat(popoverEl.style.left) || 0;
      const currTop = parseFloat(popoverEl.style.top) || 0;

      // Adjust CSS pixel by visual delta scaled by zoom factor
      const stepDeltaX = deltaX / zoomFactor;
      const stepDeltaY = deltaY / zoomFactor;

      popoverEl.style.left = `${currLeft + stepDeltaX}px`;
      popoverEl.style.top = `${currTop + stepDeltaY}px`;
    }
  }
}

export function startProductTour(force = false) {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;

  // STRICT GUARD: Never trigger tour on onboarding, login, register, or payment pages
  if (
    currentPath.startsWith('/onboarding') ||
    currentPath.startsWith('/login') ||
    currentPath.startsWith('/register') ||
    currentPath.startsWith('/pembayaran')
  ) {
    stopProductTour();
    return;
  }

  // Check if user has finished account onboarding first
  const isOnboardingDone = localStorage.getItem('employr_onboarding_completed') === 'true';
  if (!isOnboardingDone && !force) {
    return;
  }

  const isTourCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  if (isTourCompleted && !force) return;

  const isMobile = window.innerWidth < 768;

  // Responsive step definitions:
  // Desktop: sidebar on the left -> popover on the 'right', arrow points left.
  // Mobile: bottom nav at bottom -> popover on 'top', arrow points down.
  const availableSteps: DriveStep[] = TOUR_STEPS.map((step) => ({
    ...step,
    popover: {
      ...step.popover,
      side: isMobile ? ('top' as const) : ('right' as const),
      align: 'center' as const,
    },
  })).filter((step) => {
    if (typeof step.element === 'string') {
      const el = document.querySelector(step.element);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
        return false;
      }
      return true;
    }
    return true;
  });

  if (availableSteps.length === 0) return;

  const markTourDone = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch {
      // Ignore localStorage errors
    }
  };

  // Close existing driver if any
  stopProductTour();

  const handleSync = () => {
    syncDriverPopoverPosition();
  };

  window.addEventListener('resize', handleSync);
  window.addEventListener('scroll', handleSync, true);

  const driverObj: Driver = driver({
    showProgress: true,
    progressText: '{{current}} dari {{total}}',
    nextBtnText: 'Lanjut',
    prevBtnText: 'Kembali',
    doneBtnText: 'Selesai',
    allowClose: true,
    smoothScroll: true,
    popoverOffset: 12,
    stagePadding: 4,
    stageRadius: 10,
    popoverClass: 'employr-driver-popover',
    steps: availableSteps,
    onPopoverRender: () => {
      syncDriverPopoverPosition();
      requestAnimationFrame(syncDriverPopoverPosition);
    },
    onHighlighted: () => {
      syncDriverPopoverPosition();
      let count = 0;
      const interval = setInterval(() => {
        syncDriverPopoverPosition();
        count++;
        if (count > 10) clearInterval(interval);
      }, 30);
    },
    onDestroyStarted: () => {
      window.removeEventListener('resize', handleSync);
      window.removeEventListener('scroll', handleSync, true);
      markTourDone();
      driverObj.destroy();
      activeDriver = null;
    },
  });

  activeDriver = driverObj;
  driverObj.drive();
}

export function ProductTour() {
  const pathname = usePathname();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // If navigating to onboarding or auth page, destroy any active tour immediately
    if (
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/pembayaran')
    ) {
      stopProductTour();
      return;
    }

    // Listen for manual trigger events (e.g. from Settings or Help button)
    const handleManualStart = () => {
      if (window.location.pathname !== '/beranda' && window.location.pathname !== '/') {
        window.location.href = '/beranda?start_tour=true';
      } else {
        startProductTour(true);
      }
    };

    window.addEventListener('employr_start_product_tour', handleManualStart);

    // Check if redirected with ?start_tour=true
    if (typeof window !== 'undefined' && window.location.search.includes('start_tour=true')) {
      const timer = setTimeout(() => {
        startProductTour(true);
        window.history.replaceState({}, '', window.location.pathname);
      }, 500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('employr_start_product_tour', handleManualStart);
      };
    }

    // Auto trigger on first visit to beranda ONLY after onboarding is completed
    if (!hasTriggeredRef.current && typeof window !== 'undefined') {
      const isOnboardingDone = localStorage.getItem('employr_onboarding_completed') === 'true';
      const isTourCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
      const isBeranda = pathname === '/beranda' || pathname === '/';

      if (isOnboardingDone && !isTourCompleted && isBeranda) {
        // Delay to ensure cards in BerandaView are mounted
        const timer = setTimeout(() => {
          if (
            window.location.pathname.startsWith('/onboarding') ||
            window.location.pathname.startsWith('/login')
          ) {
            return;
          }
          hasTriggeredRef.current = true;
          startProductTour(false);
        }, 1200);

        return () => {
          clearTimeout(timer);
          window.removeEventListener('employr_start_product_tour', handleManualStart);
        };
      }
    }

    return () => {
      window.removeEventListener('employr_start_product_tour', handleManualStart);
    };
  }, [pathname]);

  return null;
}
