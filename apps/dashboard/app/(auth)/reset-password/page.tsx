import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordView } from '@/components/ResetPasswordView';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Atur Ulang Kata Sandi - Employr',
  description:
    'Buat kata sandi baru untuk akun Employr kamu dan pulihkan akses ke dashboard karier.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-cobalt-500" />
            <span className="text-xs font-semibold">Memuat halaman reset kata sandi...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordView />
    </Suspense>
  );
}
