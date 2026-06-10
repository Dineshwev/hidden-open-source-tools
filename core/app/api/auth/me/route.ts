import { NextResponse } from 'next/server';
import * as authService from '@/lib/services/auth.service.js';
import { getServerUser } from '@/lib/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getServerUser(req);

    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await authService.getCurrentUser(user.userId);
    return NextResponse.json({ user: currentUser }, { status: 200 });
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
