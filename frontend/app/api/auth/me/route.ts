import { NextResponse } from 'next/server';
import * as authService from '@/lib/services/auth.service.js';
import { verifyAccessToken } from '@/lib/utils/jwt.js';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const user = await authService.getCurrentUser(decoded.userId);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
