import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        firstNameEncrypted: true,
        lastNameEncrypted: true,
        phoneEncrypted: true,
        addressEncrypted: true,
        dobEncrypted: true,
        autoEmail: true,
        autoSms: true,
      }
    });

    if (!user) return null;

    const { decrypt } = require('./encryption');
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      firstName: decrypt(user.firstNameEncrypted),
      lastName: decrypt(user.lastNameEncrypted),
      phone: decrypt(user.phoneEncrypted),
      address: decrypt(user.addressEncrypted),
      dob: decrypt(user.dobEncrypted),
      autoEmail: user.autoEmail,
      autoSms: user.autoSms,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
