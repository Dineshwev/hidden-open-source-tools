import { NextResponse } from 'next/server';
import * as authService from '@/lib/services/auth.service.js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await authService.createGuestUser(body?.guestKey);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as Error & { statusCode?: number }).statusCode || 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}