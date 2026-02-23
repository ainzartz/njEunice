import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }

    // Authenticate via cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { passwordHistory: { orderBy: { createdAt: 'desc' }, take: 3 } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: 'User does not have a password set' }, { status: 400 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Validate new password complexity
    if (newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password too weak' }, { status: 400 });
    }

    // Verify new password against history (last 3)
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Cannot reuse your current password.' }, { status: 400 });
    }

    for (const history of user.passwordHistory) {
      const match = await bcrypt.compare(newPassword, history.passwordHash);
      if (match) {
        return NextResponse.json({ error: 'Cannot reuse any of your last 3 passwords.' }, { status: 400 });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const currentHashed = user.passwordHash;

    // Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Add current password to history
      await tx.passwordHistory.create({
        data: {
          userId: userId,
          passwordHash: currentHashed,
        }
      });

      // 2. Update user with new password
      await tx.user.update({
        where: { id: userId },
        data: {
          passwordHash: hashedPassword,
          lastPasswordChangeAt: new Date(),
        }
      });

      // 3. Prune history (keep latest 3)
      // Find all history for this user, ordered by creation date desc
      const histories = await tx.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });

      if (histories.length > 3) {
        const idsToDelete = histories.slice(3).map(h => h.id);
        await tx.passwordHistory.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
