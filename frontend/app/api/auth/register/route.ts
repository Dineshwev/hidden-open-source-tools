import { NextResponse } from 'next/server';
import * as authService from '@/lib/services/auth.service.js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await authService.registerUser(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
