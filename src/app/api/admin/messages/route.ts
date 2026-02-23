import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import { decrypt } from '@/lib/encryption';

// GET all messages
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstNameEncrypted: true,
            lastNameEncrypted: true,
          }
        }
      }
    });

    const decryptedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      isInbound: msg.isInbound,
      createdAt: msg.createdAt,
      user: {
        email: msg.user.email,
        firstName: msg.user.firstNameEncrypted ? decrypt(msg.user.firstNameEncrypted) : '',
        lastName: msg.user.lastNameEncrypted ? decrypt(msg.user.lastNameEncrypted) : '',
      }
    }));

    return NextResponse.json(decryptedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
