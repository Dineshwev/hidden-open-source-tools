import { NextResponse } from 'next/server';
import * as adminService from '@/lib/services/admin.service.js';
import { errorResponse } from '@/lib/utils/authHelper';

export async function GET(req: Request) {
  try {
    const adminAccessKey = req.headers.get('x-admin-access-key') || req.headers.get('Authorization')?.replace('Bearer ', '');
    const configuredAdminAccessKey = process.env.ADMIN_SECRET;

    if (!configuredAdminAccessKey) {
      return NextResponse.json(
        { error: 'Admin panel is not configured. Set ADMIN_SECRET.' },
        { status: 503 }
      );
    }

    if (!adminAccessKey || adminAccessKey !== configuredAdminAccessKey) {
      return NextResponse.json({ error: 'Invalid admin secret.' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid or missing status parameter. Expected APPROVED or REJECTED.' },
        { status: 400 }
      );
    }

    const data = await adminService.getModerationHistory(status);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    if (String(error?.message || "").includes("Can't reach database server")) {
      return NextResponse.json(
        {
          error: 'Supabase configuration error. Check SUPABASE_SERVICE_ROLE_KEY.'
        },
        { status: 503 }
      );
    }

    return errorResponse(error);
  }
}
