import { NextRequest, NextResponse } from "next/server";
import { verifyPiSession } from "@/lib/pi-session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("votely_session")?.value;

  if (!token) {
    return NextResponse.json({
      authenticated: false
    });
  }

  const user = verifyPiSession(token);

  if (!user) {
    return NextResponse.json({
      authenticated: false
    });
  }

  return NextResponse.json({
    authenticated: true,
    user
  });
}