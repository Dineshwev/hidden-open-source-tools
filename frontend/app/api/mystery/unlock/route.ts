import { NextResponse } from 'next/server';
import * as mysteryService from '@/lib/services/mystery.service.js';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import { verifyMysteryUnlockToken } from '@/lib/utils/jwt.js';

export async function POST(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const adPassToken = body?.adPassToken;

    if (!adPassToken || typeof adPassToken !== 'string') {
      return NextResponse.json({ error: 'Missing ad unlock token' }, { status: 400 });
    }

    const decoded = verifyMysteryUnlockToken(adPassToken) as { sub?: string; challengeId?: string };

    if (decoded.sub !== user.userId) {
      return NextResponse.json({ error: 'Ad unlock token does not match current user' }, { status: 403 });
    }

    const data = await mysteryService.unlockMysteryFile(user.userId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
