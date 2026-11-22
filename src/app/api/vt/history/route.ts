import { NextRequest, NextResponse } from "next/server";
import { requirePiSession } from "@/lib/require-pi-session";
import { requestVotelyBackend } from "@/lib/votely-backend";

function parsePositiveInteger(value: string | null, fallback: number, maximum: number) {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }

  return Math.min(parsed, maximum);
}

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = requirePiSession(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const limit = parsePositiveInteger(request.nextUrl.searchParams.get("limit"), 20, 50);
  const cursor = parsePositiveInteger(request.nextUrl.searchParams.get("cursor"), 0, Number.MAX_SAFE_INTEGER);

  if (limit === null || cursor === null) {
    return NextResponse.json(
      { success: false, error: "Tham số phân trang không hợp lệ" },
      { status: 400 }
    );
  }

  const query = new URLSearchParams({ limit: limit.toString() });

  if (cursor > 0) {
    query.set("cursor", cursor.toString());
  }

  try {
    const backendResponse = await requestVotelyBackend(
      `/api/votely/vt/history?${query.toString()}`,
      { userUid: session.uid }
    );
    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("Votely history request failed:", error);

    return NextResponse.json(
      { success: false, error: "Không thể tải lịch sử VT" },
      { status: 502 }
    );
  }
}
