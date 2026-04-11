import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/services/contact.service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || "").trim();
    const mode = String(body?.mode || "").trim() as "identified" | "anonymous";
    const social_handle = body?.social_handle ? String(body.social_handle).trim() : undefined;
    const email = body?.email ? String(body.email).trim() : undefined;
    const thread_id = body?.thread_id ? String(body.thread_id).trim() : undefined;

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required." }, { status: 400 });
    }

    if (mode !== "identified" && mode !== "anonymous") {
      return NextResponse.json({ success: false, error: "Invalid mode." }, { status: 400 });
    }

    if (mode === "identified" && !social_handle && !email) {
      return NextResponse.json(
        { success: false, error: "social_handle or email is required for identified messages." },
        { status: 400 }
      );
    }

    const inserted = await sendMessage({
      message,
      mode,
      social_handle,
      email,
      thread_id
    });

    return NextResponse.json({ success: true, id: inserted.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}