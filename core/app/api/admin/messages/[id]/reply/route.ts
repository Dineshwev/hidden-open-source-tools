import { NextResponse } from "next/server";
import { replyToMessage } from "@/lib/services/contact.service";
import { isAuthorizedByHeader } from "@/lib/utils/admin-auth";
import { catchError } from "@/lib/utils/api-response";
import type { RouteContext } from "@/lib/types/api.types";

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const auth = isAuthorizedByHeader(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const reply_text = String(body?.reply_text || "").trim();
    const is_public = Boolean(body?.is_public);

    if (!reply_text) {
      return NextResponse.json({ success: false, error: "reply_text is required." }, { status: 400 });
    }

    const reply = await replyToMessage(params.id, reply_text, is_public);

    return NextResponse.json({ success: true, reply }, { status: 201 });
  } catch (error: unknown) {
    return catchError(error);
  }
}
