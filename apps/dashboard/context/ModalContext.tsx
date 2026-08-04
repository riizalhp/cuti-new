'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from '@/components/UpgradeModal';
import { PromoModal } from '@/components/PromoModal';

interface ModalContextType {
  isUpgradeOpen: boolean;
  isPromoOpen: boolean;
  openUpgrade: () => void;
  closeUpgrade: () => void;
  openPromo: () => void;
  closePromo: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const router = useRouter();

  const openUpgrade = () => setIsUpgradeOpen(true);
  const closeUpgrade = () => setIsUpgradeOpen(false);
  const openPromo = () => setIsPromoOpen(true);
  const closePromo = () => setIsPromoOpen(false);

  const handleOpenPayment = () => {
    setIsUpgradeOpen(false);
    router.push('/pembayaran');
  };

  const handleClaimPromo = (promoCode: string) => {
    setIsPromoOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('promo_claimed_code', promoCode);
    }
    router.push('/pembayaran');
  };

  return (
    <ModalContext.Provider
      value={{
        isUpgradeOpen,
        isPromoOpen,
        openUpgrade,
        closeUpgrade,
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
      <PromoModal
        isOpen={isPromoOpen}
        onClose={closePromo}
        onClaimPromo={handleClaimPromo}
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
