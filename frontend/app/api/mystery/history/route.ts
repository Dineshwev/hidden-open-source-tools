import { NextResponse } from 'next/server';
import * as mysteryService from '@/lib/services/mystery.service.js';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';

export async function GET(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user) return unauthorizedResponse();

    const data = await mysteryService.getDownloadHistory(user.userId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
