import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Firebase Admin singleton
function getFirebaseAdmin() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are not configured');
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return getAuth();
}

// Get verified Firebase user from request
export async function getServerUser(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const idToken = authHeader.split(' ')[1];
    if (!idToken || idToken.startsWith('guest:')) {
      return null;
    }
    const auth = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(idToken);
    return {
      userId: decoded.uid,
      email: decoded.email || null,
      role: decoded.role || 'USER'
    };
  } catch (err: any) {
    const message = String(err?.message || '');
    if (!message.includes('Firebase Admin credentials are not configured')) {
      console.error('[AUTH] Firebase token verification failed:', message);
    }
    return null;
  }
}

// Check if user is admin
export async function getServerAdmin(req: Request) {
  const user = await getServerUser(req);
  if (!user) return null;
  
  // Check ADMIN_SECRET header as fallback for admin routes
  const adminSecret = req.headers.get('x-admin-secret');
  if (adminSecret === process.env.ADMIN_SECRET) {
    return { ...user, role: 'ADMIN' };
  }
  
  return null;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' }, 
    { status: 401 }
  );
}

export function errorResponse(error: any) {
  const statusCode = error.statusCode || 500;
  return NextResponse.json(
    { error: error.message || 'Internal Server Error' },
    { status: statusCode }
  );
}
