import { NextResponse } from "next/server";
import { addReaction } from "@/lib/services/contact.service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const reply_id = String(body?.reply_id || "").trim();
    const reaction = String(body?.reaction || "").trim() as "helpful" | "not_helpful";

    if (!reply_id) {
      return NextResponse.json({ success: false, error: "reply_id is required." }, { status: 400 });
    }

    if (reaction !== "helpful" && reaction !== "not_helpful") {
      return NextResponse.json(
        { success: false, error: "Invalid reaction. Use 'helpful' or 'not_helpful'." },
        { status: 400 }
      );
    }

    await addReaction(reply_id, reaction);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}