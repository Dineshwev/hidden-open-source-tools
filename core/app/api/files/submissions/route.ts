import { NextResponse } from 'next/server';
import * as fileService from '@/lib/services/file.service.js';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();

    const data = await fileService.getUserSubmissions(user.userId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
