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

function parseChallengeToken(challengeToken: string) {
  const [encodedPayload, signature] = challengeToken.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return payload;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerUser(req);
    const adminSecret = process.env.ADMIN_SECRET?.trim();
    const authHeader = req.headers.get("authorization") || "";
    const accessKeyHeader = req.headers.get("x-admin-access-key") || "";
    const tokenFromAccessHeader = accessKeyHeader.trim();
    const tokenFromBearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    const tokenFromRawAuth = !authHeader.toLowerCase().startsWith("bearer ") ? authHeader.trim() : "";
    const token = tokenFromAccessHeader || tokenFromBearer || tokenFromRawAuth;

    if (!adminSecret) {
      return NextResponse.json({ error: "Admin auth is not configured. Set ADMIN_SECRET." }, { status: 503 });
    }

    const userId = user?.userId || 'anonymous_box_user';

    const { challengeToken } = await req.json().catch(() => ({ challengeToken: null }));

    if (!challengeToken || typeof challengeToken !== 'string') {
      return NextResponse.json({ error: 'Missing ad challenge token' }, { status: 400 });
    }

    const payload = parseChallengeToken(challengeToken);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired ad challenge token' }, { status: 400 });
    }

    if (payload.userId !== userId) {
      return NextResponse.json({ error: 'Ad challenge session mismatch' }, { status: 403 });
    }

    if (!payload.issuedAt || Date.now() - Number(payload.issuedAt) < 5000) {
      return NextResponse.json({ error: 'Sponsor verification incomplete' }, { status: 403 });
    }

    const adPassToken = crypto.randomUUID();

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
