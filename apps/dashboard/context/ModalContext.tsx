'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from '@/components/UpgradeModal';
import { WhatsNewModal } from '@/components/WhatsNewModal';

interface ModalContextType {
  isUpgradeOpen: boolean;
  isWhatsNewOpen: boolean;
  isPromoOpen: boolean;
  openUpgrade: () => void;
  closeUpgrade: () => void;
  openWhatsNew: () => void;
  closeWhatsNew: () => void;
  openPromo: () => void;
  closePromo: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const router = useRouter();

  const openUpgrade = useCallback(() => setIsUpgradeOpen(true), []);
  const closeUpgrade = useCallback(() => setIsUpgradeOpen(false), []);
  const openWhatsNew = useCallback(() => setIsWhatsNewOpen(true), []);
  const closeWhatsNew = useCallback(() => setIsWhatsNewOpen(false), []);

  // Backward compatibility alias for Promo modal
  const openPromo = openWhatsNew;
  const closePromo = closeWhatsNew;

  const handleOpenPayment = () => {
    setIsUpgradeOpen(false);
    router.push('/pembayaran');
  };

  const handleExploreFeature = (featureKey: string) => {
    setIsWhatsNewOpen(false);
    if (featureKey === 'cv-ats') {
      router.push('/cv-screener');
    } else if (featureKey === 'job-tracker') {
      router.push('/tracker');
    } else if (featureKey === 'interview-sim') {
      router.push('/interview');
    } else if (featureKey === 'misi-reward') {
      router.push('/misi');
    }
  };

  return (
    <ModalContext.Provider
      value={{
        isUpgradeOpen,
        isWhatsNewOpen,
        isPromoOpen: isWhatsNewOpen,
        openUpgrade,
        closeUpgrade,
        openWhatsNew,
        closeWhatsNew,
        openPromo,
        closePromo,
      }}
    >
      {children}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={closeUpgrade}
        onOpenPayment={handleOpenPayment}
      />
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={closeWhatsNew}
        onExploreFeature={handleExploreFeature}
      />
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
};
