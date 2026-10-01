import { NextResponse } from "next/server";
import { getThreadReplies } from "@/lib/services/contact.service";
import { catchError } from "@/lib/utils/api-response";
import type { RouteContext } from "@/lib/types/api.types";

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const data = await getThreadReplies(params.id);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    return catchError(error);
  }
}
