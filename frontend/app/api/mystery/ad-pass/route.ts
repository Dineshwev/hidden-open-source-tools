import { NextResponse } from 'next/server';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import {
  signMysteryUnlockToken,
  verifyMysteryAdChallengeToken
} from '@/lib/utils/jwt.js';

const usedChallengeIds = new Set<string>();

export async function POST(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user) return unauthorizedResponse();

    const { challengeToken } = await req.json().catch(() => ({ challengeToken: null }));

    if (!challengeToken || typeof challengeToken !== 'string') {
      return NextResponse.json({ error: 'Missing ad challenge token' }, { status: 400 });
    }

    const decoded = verifyMysteryAdChallengeToken(challengeToken) as {
      sub?: string;
      jti?: string;
      iat?: number;
    };

    if (decoded.sub !== user.userId) {
      return NextResponse.json({ error: 'Ad challenge does not belong to this user' }, { status: 403 });
    }

    if (decoded.iat && Date.now() / 1000 - decoded.iat < 5) {
      return NextResponse.json({ error: 'Sponsor verification incomplete' }, { status: 403 });
    }

    if (!decoded.jti) {
      return NextResponse.json({ error: 'Invalid ad challenge token' }, { status: 400 });
    }

    if (usedChallengeIds.has(decoded.jti)) {
      return NextResponse.json({ error: 'Ad challenge already used' }, { status: 409 });
    }

    usedChallengeIds.add(decoded.jti);

    const adPassToken = signMysteryUnlockToken(user.userId, decoded.jti);

    return NextResponse.json(
      {
        data: {
          adPassToken
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorResponse(error);
  }
}