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

  // Clear session cookies
  response.cookies.set({
    name: 'cuti_user_session',
    value: '',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  response.cookies.set({
    name: 'cuti_auth_token',
    value: '',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
