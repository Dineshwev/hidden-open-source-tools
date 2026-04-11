import { NextResponse } from 'next/server';
import { AppError } from '@/lib/utils/appError';
import * as mysteryService from '@/lib/services/mystery.service.js';

// Firebase Admin for token verification
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin once
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

export async function POST(req: Request) {
  try {
    // Get Firebase token from Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const idToken = authHeader.replace('Bearer ', '').trim();

    let userId = 'anonymous_box_user';

    // If token provided, verify with Firebase
    if (idToken && !idToken.startsWith('guest:')) {
      try {
        const auth = getFirebaseAdmin();
        const decoded = await auth.verifyIdToken(idToken);
        userId = decoded.uid;
      } catch (firebaseError: any) {
        console.warn('[UNLOCK] Firebase token invalid, using anonymous:', firebaseError.message);
        // Allow anonymous unlock - do not block
      }
    }

    // Call mystery service - no JWT needed anymore
    const data = await mysteryService.unlockMysteryFile(userId);
    return NextResponse.json({ data }, { status: 200 });

  } catch (error: any) {
    console.error('[UNLOCK] Unexpected Failure:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message }, 
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
