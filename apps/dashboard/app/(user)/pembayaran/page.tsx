'use client';

import { PaymentView } from '@/components/PaymentView';
import { useRouter } from 'next/navigation';

export default function PembayaranPage() {
  const router = useRouter();

  return (
    <PaymentView
      onBackToDashboard={() => router.push('/beranda')}
      onPaymentSuccess={() => {
        // Keep user on success screen or navigate
      }}
    />
  );
}
