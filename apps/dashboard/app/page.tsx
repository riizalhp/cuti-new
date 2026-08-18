import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('cuti_user_session');

  if (sessionCookie?.value) {
    redirect('/beranda');
  }

  redirect('/login');
}
