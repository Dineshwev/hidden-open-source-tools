import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/utils/jwt.js';

export function getServerUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    return decoded ? decoded : null;
  } catch (err) {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function errorResponse(error: any) {
  const statusCode = error.statusCode || 500;
  return NextResponse.json(
    { error: error.message || 'Internal Server Error' },
    { status: statusCode }
  );
}
