import { NextRequest, NextResponse } from "next/server";
import { requirePiSession } from "@/lib/require-pi-session";
import { requestVotelyBackend } from "@/lib/votely-backend";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = requirePiSession(request);

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const backendResponse = await requestVotelyBackend(
      "/api/votely/vt/balance",
      { userUid: session.uid }
    );
    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Votely balance request failed:", error);

    return NextResponse.json(
      { success: false, error: "Không thể tải số dư VT" },
      { status: 502 }
    );
  }
}
