'use client';

import { PaymentView } from '@/components/PaymentView';
import { useRouter } from 'next/navigation';

export default function StandalonePembayaranPage() {
  const router = useRouter();

  return (
    <PaymentView
      onBackToDashboard={() => router.push('/beranda')}
      onPaymentSuccess={() => {
        // Callback after successful transaction
      }}
    />
  );
}
