import { NextResponse } from 'next/server';
import * as adminService from '@/lib/services/admin.service.js';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';

export async function GET(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user || user.role !== 'ADMIN') return unauthorizedResponse();

    const data = await adminService.getPendingUploads();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
