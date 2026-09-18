import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Berhasil logout.' },
    { status: 200, headers: corsHeaders }
  );

  // Clear session cookies (employr + legacy cuti)
  const cookieNames = [
    'employr_user_session',
    'employr_auth_session',
    'employr_auth_token',
    'cuti_user_session',
    'cuti_auth_session',
    'cuti_auth_token'
  ];

  cookieNames.forEach((name) => {
    response.cookies.set({
      name,
      value: '',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
    });
  });

  return response;
}
