import { NextResponse } from 'next/server';
import * as mysteryService from '@/lib/services/mystery.service.js';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';

export async function GET(req: Request) {
  try {
    const user = getServerUser(req);
    // Allowing anonymous history check (will be empty)
    const userId = user?.userId || "anonymous_box_user";

    const data = await mysteryService.getDownloadHistory(userId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
