import { NextRequest, NextResponse } from "next/server";
import { createPiSession } from "@/lib/pi-session";

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

    // Xác minh trực tiếp với Pi Platform
    const piResponse = await fetch(
      "https://api.minepi.com/v2/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
      }
    );

    if (!piResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Pi accessToken không hợp lệ" },
        { status: 401 }
      );
    }

    const data = await piResponse.json();

    // Hỗ trợ cả cấu trúc dữ liệu trực tiếp và dạng user lồng nhau
    const piUser = data.user ?? data;

    if (!piUser.uid || !piUser.username) {
      return NextResponse.json(
        { success: false, error: "Pi không trả về thông tin tài khoản hợp lệ" },
        { status: 401 }
      );
    }

    const session = createPiSession({
      uid: piUser.uid,
      username: piUser.username
    });

    const response = NextResponse.json({
      success: true,
      user: {
        uid: piUser.uid,
        username: piUser.username
      }
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
      { success: false, error: "Không thể xác minh tài khoản Pi" },
      { status: 500 }
    );
  }
}