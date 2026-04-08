import { NextResponse } from 'next/server';
import { prisma } from '@/lib/backend_lib/prisma';
import { AppError } from '@/lib/utils/appError';
import * as mysteryService from '@/lib/services/mystery.service.js';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import { verifyMysteryUnlockToken } from '@/lib/utils/jwt.js';

export async function POST(req: Request) {
  try {
    // Ping database
    await prisma.$connect().catch((err: any) => {
      console.error("[DB] Connection failed:", err);
      throw new AppError("Database connection failed", 500);
    });

    const user = getServerUser(req);
    // Use real user ID or a fallback anonymous ID
    const userId = user?.userId || "anonymous_box_user";

    const body = await req.json().catch(() => ({}));
    const adPassToken = body?.adPassToken;

    if (!adPassToken || typeof adPassToken !== 'string') {
      console.warn('[UNLOCK] Missing adPassToken in body:', body);
      return NextResponse.json({ error: 'Missing ad unlock token' }, { status: 400 });
    }

    try {
      const decoded = verifyMysteryUnlockToken(adPassToken) as { sub?: string; challengeId?: string };
      // Check if the token belongs to the requester (real or anonymous)
      if (decoded.sub !== userId) {
        console.warn('[UNLOCK] Token sub mismatch:', { tokenSub: decoded.sub, userId });
        return NextResponse.json({ error: 'Ad unlock token session mismatch' }, { status: 403 });
      }

      const data = await mysteryService.unlockMysteryFile(userId);
      return NextResponse.json({ data }, { status: 200 });
    } catch (jwtError: any) {
      console.error('[UNLOCK] JWT Verification Failed:', jwtError.message);
      return NextResponse.json({ error: 'Invalid or expired ad unlock token' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('[UNLOCK] Unexpected Failure:', error);
    return errorResponse(error);
  }
}
