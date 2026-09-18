import type { Metadata } from 'next';
import { ForgotPasswordView } from '@/components/ForgotPasswordView';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi',
  description:
    'Setel ulang kata sandi akun Employr kamu untuk kembali mengakses dashboard karier.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
