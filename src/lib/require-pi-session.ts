import { NextRequest, NextResponse } from "next/server";
import { verifyPiSession, type PiUser } from "@/lib/pi-session";

export function requirePiSession(
  request: NextRequest
): PiUser | NextResponse {
  const token = request.cookies.get("votely_session")?.value;
  const user = token ? verifyPiSession(token) : null;

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Bạn cần đăng nhập Pi" },
      { status: 401 }
    );
  }

  return user;
}
