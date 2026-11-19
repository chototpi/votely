"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PiCallbackPage() {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("Đang xác minh tài khoản Pi...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function handleCallback() {
      try {
        const params = new URLSearchParams(
          window.location.hash.slice(1)
        );

        const accessToken = params.get("access_token");
        const returnedState = params.get("state");
        const error = params.get("error");

        // Xóa token khỏi URL ngay sau khi đọc
        window.history.replaceState(
          null,
          "",
          window.location.pathname
        );

        const expectedState =
          sessionStorage.getItem("pi_oauth_state");

        sessionStorage.removeItem("pi_oauth_state");

        if (
          !expectedState ||
          returnedState !== expectedState
        ) {
          throw new Error("Xác minh OAuth state thất bại");
        }

        if (error) {
          throw new Error("Pi Sign-In bị hủy hoặc không thành công: " + error);
        }

        if (!accessToken) {
          throw new Error("Pi không trả về accessToken");
        }

        const response = await fetch("/api/auth/pi", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ accessToken })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Xác minh Pi thất bại");
        }

        setMessage("Đăng nhập thành công!");
        router.replace("/");
        router.refresh();

      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Đăng nhập không thành công"
        );
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-violet-100 text-3xl font-bold text-violet-700">
          π
        </div>

        <h1 className="text-xl font-extrabold text-slate-900">
          Votely Pi Sign-In
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          {message}
        </p>
      </div>
    </main>
  );
}