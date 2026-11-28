"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePiAuth } from "@/contexts/pi-auth-context";

export default function PiOAuthCallbackPage() {
  const router = useRouter();
  const { completeLogin } = usePiAuth();
  const [message, setMessage] = useState("Đang hoàn tất đăng nhập Pi...");

  useEffect(() => {
    let active = true;
    const finish = async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get("access_token");
      const state = params.get("state");
      const error = params.get("error");
      window.history.replaceState(null, "", window.location.pathname);

      if (error) throw new Error(error === "access_denied" ? "Bạn đã từ chối đăng nhập Pi." : `Pi Sign-In gặp lỗi: ${error}`);
      if (!token || !state) throw new Error("Pi Sign-In không trả về accessToken hoặc state.");
      await completeLogin(token, state);
      if (active) router.replace("/");
    };
    finish().catch((error) => {
      if (active) setMessage(error instanceof Error ? error.message : "Đăng nhập Pi thất bại.");
    });
    return () => { active = false; };
  }, [completeLogin, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <h1 className="font-heading text-xl font-bold">Pi Sign-In</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {message !== "Đang hoàn tất đăng nhập Pi..." && (
          <button className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-primary-foreground" onClick={() => router.replace("/")}>
            Quay lại Votely
          </button>
        )}
      </div>
    </main>
  );
}
