import { NextResponse } from 'next/server';
import * as adminService from '@/lib/services/admin.service.js';
import { errorResponse } from '@/lib/utils/authHelper';

export async function GET(req: Request) {
  try {
    const adminAccessKey = req.headers.get('x-admin-access-key');
    const configuredAdminAccessKey = process.env.ADMIN_PANEL_ACCESS_KEY;

    if (!configuredAdminAccessKey) {
      return NextResponse.json(
        { error: 'Admin panel is not configured. Set ADMIN_PANEL_ACCESS_KEY.' },
        { status: 503 }
      );
    }

    if (!adminAccessKey || adminAccessKey !== configuredAdminAccessKey) {
      return NextResponse.json({ error: 'Invalid admin access key.' }, { status: 401 });
    }

    const data = await adminService.getPendingUploads();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    if (String(error?.message || "").includes("Can't reach database server")) {
      return NextResponse.json(
        {
          error: 'Database is not reachable. Start your local Postgres or fix DATABASE_URL before opening the admin queue.'
        },
        { status: 503 }
      );
    }

    return errorResponse(error);
  }
}
