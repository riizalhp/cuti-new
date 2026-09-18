import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginView } from '@/components/LoginView';

export const metadata: Metadata = {
  title: 'Masuk ke Akun',
  description:
    'Masuk ke akun Employr kamu untuk mengelola CV ATS, melacak lamaran pekerjaan, dan memantau progres karier.',
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('employr_user_session') || cookieStore.get('cuti_user_session');

  if (sessionCookie?.value) {
    redirect('/beranda');
  }

  return <LoginView />;
}
