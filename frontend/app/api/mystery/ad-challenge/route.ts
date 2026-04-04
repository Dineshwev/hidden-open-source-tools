import { NextResponse } from 'next/server';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import { signMysteryAdChallengeToken } from '@/lib/utils/jwt.js';

export async function POST(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user) return unauthorizedResponse();

    const challengeToken = signMysteryAdChallengeToken(user.userId);

    return NextResponse.json(
      {
        data: {
          challengeToken
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorResponse(error);
  }
}