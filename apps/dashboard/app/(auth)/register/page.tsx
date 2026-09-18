import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RegisterView } from '@/components/RegisterView';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru',
  description:
    'Daftar akun gratis di Employr dan bangun CV standar ATS serta strategi lamaran kerja impianmu sekarang.',
};

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('employr_user_session') || cookieStore.get('cuti_user_session');

  if (sessionCookie?.value) {
    redirect('/beranda');
  }

  return <RegisterView />;
}
