import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerUser, errorResponse } from '@/lib/utils/authHelper';

function getChallengeSecret() {
  return (
    process.env.ADMIN_PANEL_ACCESS_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'local-mystery-challenge-secret'
  );
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', getChallengeSecret()).update(payload).digest('hex');
}

function encodeChallengeToken(userId: string) {
  const payload = JSON.stringify({
    userId,
    issuedAt: Date.now(),
    nonce: crypto.randomUUID()
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser(req);
    const userId = user?.userId || 'anonymous_box_user';
    const challengeToken = encodeChallengeToken(userId);

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
