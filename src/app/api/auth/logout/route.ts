import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  const response = NextResponse.json({ success: true });
  const cookieStore = await cookies();

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
