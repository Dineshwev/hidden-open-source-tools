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

import { getAdmin } from '@/lib/backend_lib/supabase-server';

export async function POST(req: Request) {
  try {
    // Get Firebase token from Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const idToken = authHeader.replace('Bearer ', '').trim();

    const ANON_UUID = '00000000-0000-0000-0000-000000000000';
    let userId = ANON_UUID;

    // If token provided, verify with Firebase
    if (idToken && !idToken.startsWith('guest:')) {
      try {
        const auth = getFirebaseAdmin();
        const decoded = await auth.verifyIdToken(idToken);
        const firebaseUid = decoded.uid;

        const supabase = getAdmin();

        // 1. Look up Supabase user by firebase_uid
        const { data: supabaseUser, error: lookupError } = await supabase
          .from('users')
          .select('id')
          .eq('firebase_uid', firebaseUid)
          .single();

        if (supabaseUser?.id) {
          userId = supabaseUser.id;
        } else {
          // 2. If user not found, create new user
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              firebase_uid: firebaseUid,
              username: `user_${firebaseUid.slice(0, 8)}`,
              email: decoded.email || '',
              role: 'USER'
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('[UNLOCK] Failed to create new user:', insertError.message);
            // Fallback to anonymous on insert fail
            userId = ANON_UUID;
          } else if (newUser?.id) {
            userId = newUser.id;
          }
        }
      } catch (firebaseError: any) {
        console.warn('[UNLOCK] Firebase token invalid, using anonymous:', firebaseError.message);
        // Allow anonymous unlock - do not block
      }
    }

    // Call mystery service - passing true Supabase UUID
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
