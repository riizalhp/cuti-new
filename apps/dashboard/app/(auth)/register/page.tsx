import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RegisterView } from '@/components/RegisterView';

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('cuti_user_session');

  if (sessionCookie?.value) {
    redirect('/beranda');
  }

  return <RegisterView />;
}
