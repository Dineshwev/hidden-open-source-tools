import { NextResponse } from "next/server";
import { markAsRead } from "@/lib/services/contact.service";
import { isAuthorizedByHeader } from "@/lib/utils/admin-auth";
import { catchError } from "@/lib/utils/api-response";
import type { RouteContext } from "@/lib/types/api.types";

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const auth = isAuthorizedByHeader(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await markAsRead(params.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return catchError(error);
  }
}
