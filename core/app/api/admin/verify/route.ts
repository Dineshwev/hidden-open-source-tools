import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET?.trim();

    if (!adminSecret) {
      return NextResponse.json(
        { success: false, error: "Admin auth is not configured on server." },
        { status: 503 }
      );
    }

    if (secret === adminSecret) {
      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ success: false, verified: false, error: "Invalid secret" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}
