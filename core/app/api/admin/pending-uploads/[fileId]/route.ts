import { NextResponse } from 'next/server';
import * as adminService from '@/lib/services/admin.service.js';
import { getServerUser, errorResponse } from '@/lib/utils/authHelper';
import { getAdmin } from '@/lib/backend_lib/supabase-server.ts';

type RouteContext = {
  params: {
    fileId: string;
  };
};

export async function PATCH(req: Request, { params }: RouteContext) {
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

    const user = await getServerUser(req);
    let adminId = user?.role === 'ADMIN' ? user.userId : null;

    if (!adminId) {
      const { data: fallbackAdmin, error: fallbackAdminError } = await getAdmin()
        .from("users")
        .select("id")
        .eq("role", "ADMIN")
        .limit(1)
        .maybeSingle();

      if (fallbackAdminError) {
        return NextResponse.json(
          { error: fallbackAdminError.message || 'Failed to fetch admin account.' },
          { status: 503 }
        );
      }

      if (!fallbackAdmin) {
        return NextResponse.json(
          { error: 'No admin account found. Create at least one ADMIN user first.' },
          { status: 503 }
        );
      }

      adminId = fallbackAdmin.id;
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status;

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'Invalid status. Expected APPROVED or REJECTED.' },
        { status: 400 }
      );
    }

    const data = await adminService.moderateUpload({
      adminId,
      fileId: params.fileId,
      status
    });

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
