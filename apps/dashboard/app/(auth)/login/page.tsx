import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginView } from '@/components/LoginView';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('cuti_user_session');

  if (sessionCookie?.value) {
    redirect('/beranda');
  }

  return <LoginView />;
}
