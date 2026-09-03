'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StandalonePembayaranPage() {
  const router = useRouter();

  // Hidden / Locked: redirect directly to beranda
  useEffect(() => {
    router.replace('/beranda');
  }, [router]);

  return null;
}
