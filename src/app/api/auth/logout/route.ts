import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieStore = await cookies();

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
