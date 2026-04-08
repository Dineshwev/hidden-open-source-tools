import { NextResponse } from 'next/server';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import { signMysteryAdChallengeToken } from '@/lib/utils/jwt.js';

export async function POST(req: Request) {
  try {
    const user = getServerUser(req);
    // Use the real user ID or a fallback anonymous session ID
    const userId = user?.userId || "anonymous_box_user";
    const challengeToken = signMysteryAdChallengeToken(userId);

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