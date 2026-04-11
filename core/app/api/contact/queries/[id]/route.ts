import { NextResponse } from "next/server";
import { getThreadReplies } from "@/lib/services/contact.service";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const data = await getThreadReplies(params.id);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}