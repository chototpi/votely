import { createHash, createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.VOTELY_BACKEND_URL || "https://chototpi.site/register-backend";
const SERVICE_SECRET = process.env.VOTELY_SERVICE_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!SERVICE_SECRET) {
      return NextResponse.json({ success: false, error: "Thiếu cấu hình xác thực dịch vụ trên Vercel." }, { status: 503 });
    }
    const body = await request.json();
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    if (!accessToken || accessToken.length > 4096) {
      return NextResponse.json({ success: false, error: "Pi accessToken không hợp lệ." }, { status: 400 });
    }

    const payloadBody = { accessToken };
    const timestamp = String(Date.now());
    const requestId = randomUUID();
    const userUid = "";
    const endpoint = "/api/votely/sync-user";
    const bodyHash = createHash("sha256").update(JSON.stringify(payloadBody)).digest("hex");
    const signaturePayload = ["POST", endpoint, timestamp, requestId, bodyHash, userUid].join("\n");
    const signature = createHmac("sha256", SERVICE_SECRET).update(signaturePayload).digest("hex");

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Votely-Timestamp": timestamp,
        "X-Votely-Request-Id": requestId,
        "X-Votely-Signature": signature,
        "X-Votely-User-Uid": userUid,
      },
      body: JSON.stringify(payloadBody),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Backend không xác minh được tài khoản Pi." },
        { status: response.status || 502 },
      );
    }
    return NextResponse.json({
      success: true,
      user: result.user,
      balance: Number(result.balance ?? 0),
    });
  } catch (error) {
    console.error("[Votely Pi auth]", error);
    return NextResponse.json({ success: false, error: "Không thể kết nối máy chủ xác thực Votely." }, { status: 500 });
  }
}
