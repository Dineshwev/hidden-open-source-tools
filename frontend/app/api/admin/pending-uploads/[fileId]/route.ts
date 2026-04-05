import { NextResponse } from 'next/server';
import * as adminService from '@/lib/services/admin.service.js';
import { getServerUser, errorResponse } from '@/lib/utils/authHelper';
import { prisma } from '@/lib/backend_lib/prisma.js';

type RouteContext = {
  params: {
    fileId: string;
  };
};

export async function PATCH(req: Request, { params }: RouteContext) {
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

    const user = getServerUser(req);
    let adminId = user?.role === 'ADMIN' ? user.userId : null;

    if (!adminId) {
      const fallbackAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

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
          error: 'Database is not reachable. Start your local Postgres or fix DATABASE_URL before moderating uploads.'
        },
        { status: 503 }
      );
    }

    return errorResponse(error);
  }
}