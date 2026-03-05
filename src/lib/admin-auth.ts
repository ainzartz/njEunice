import { getCurrentUser } from './auth-server';
import { NextResponse } from 'next/server';

export async function ensureAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    };
  }

  return {
    authorized: true,
    user: currentUser
  };
}
