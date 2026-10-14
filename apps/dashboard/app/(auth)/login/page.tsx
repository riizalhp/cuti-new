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

  if (sessionCookie?.value && sessionCookie.value.trim().length > 2) {
    try {
      const decoded = decodeURIComponent(sessionCookie.value);
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.email) {
        redirect('/beranda');
      }
    } catch {
      // Invalid/cleared cookie, allow user to access LoginView
    }
  }

  return <LoginView />;
}
