import { NextResponse } from "next/server";
import { getAllMessagesAdmin } from "@/lib/services/contact.service";
import { isAuthorizedByHeader } from "@/lib/utils/admin-auth";
import { catchError } from "@/lib/utils/api-response";

export async function GET(req: Request) {
  try {
    const auth = isAuthorizedByHeader(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");

    const data = await getAllMessagesAdmin(page, limit);

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error: unknown) {
    return catchError(error);
  }
}
