
import { NextRequest, NextResponse } from "next/server";
import { createPiSession } from "@/lib/pi-session";
import { requestVotelyBackend } from "@/lib/votely-backend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (
      typeof accessToken !== "string" ||
      !accessToken.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Thiếu accessToken" },
        { status: 400 }
      );
    }

    // 1. Xác minh accessToken trực tiếp với Pi
    const piResponse = await fetch(
      "https://api.minepi.com/v2/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!piResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Pi accessToken không hợp lệ" },
        { status: 401 }
      );
    }

    const data = await piResponse.json();
    const piUser = data.user ?? data;

    if (!piUser.uid || !piUser.username) {
      return NextResponse.json(
        {
          success: false,
          error: "Pi không trả về thông tin tài khoản hợp lệ"
        },
        { status: 401 }
      );
    }

    // 2. Đồng bộ tài khoản với MySQL trên DirectAdmin
    const syncResponse = await requestVotelyBackend(
      "/api/votely/sync-user",
      {
        method: "POST",
        body: { accessToken }
      }
    );

    const syncData = await syncResponse.json();

    if (!syncResponse.ok || !syncData.success) {
      console.error("Votely sync failed:", syncData);

      return NextResponse.json(
        {
          success: false,
          error: "Không thể đồng bộ tài khoản Votely"
        },
        { status: 502 }
      );
    }

    // 3. Tạo phiên đăng nhập sau khi đồng bộ thành công
    const session = createPiSession({
      uid: piUser.uid,
      username: piUser.username
    });

    const response = NextResponse.json({
      success: true,
      user: {
        uid: piUser.uid,
        username: piUser.username
      },
      balance: syncData.balance
    });

    response.cookies.set("votely_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error("Pi authentication error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Không thể xác minh hoặc đồng bộ tài khoản Votely"
      },
      { status: 500 }
    );
  }
}
