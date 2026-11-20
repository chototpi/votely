
"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

declare global {
  interface Window {
    Pi?: {
      init: (options: {
        version: string;
        sandbox: boolean;
      }) => void;

      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<{
        accessToken: string;
      }>;
    };
  }
}

type PiUser = {
  uid: string;
  username: string;
};

export function PiAuthButton() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  async function verifyToken(accessToken: string) {
    const response = await fetch("/api/auth/pi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ accessToken })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Đăng nhập thất bại");
    }

    setUser(data.user);
  }

  async function login() {
    setLoading(true);
    setMessage("");

    try {
      const isPiBrowser =
        /pibrowser/i.test(navigator.userAgent);

      if (isPiBrowser) {
        if (!window.Pi) {
          throw new Error("Không tải được Pi SDK. Hãy thử tải lại trang.");
        }

        window.Pi.init({
          version: "2.0",
          sandbox: false
        });

        const auth = await window.Pi.authenticate(
          ["username"],
          () => {}
        );

        await verifyToken(auth.accessToken);

      } else {
        const clientId = process.env.NEXT_PUBLIC_PI_CLIENT_ID;
        const redirectUri =
          process.env.NEXT_PUBLIC_PI_REDIRECT_URI;

        if (!clientId || !redirectUri) {
          throw new Error("Thiếu cấu hình Pi Sign-In");
        }

        const state = crypto.randomUUID();

        sessionStorage.setItem("pi_oauth_state", state);

        const url = new URL(
          "https://accounts.pinet.com/oauth/authorize"
        );

        url.searchParams.set("response_type", "token");
        url.searchParams.set("client_id", clientId);
        url.searchParams.set("redirect_uri", redirectUri);
        url.searchParams.set("scope", "username");
        url.searchParams.set("state", state);

        window.location.assign(url.toString());
        return;
      }

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể đăng nhập Pi"
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });

    setUser(null);
    setMessage("");
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-violet-50 px-3 py-2 text-sm font-bold text-votely-purple">
          @{user.username}
        </span>

        <button
          onClick={logout}
          title="Đăng xuất"
          className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-slate-500 hover:bg-violet-50"
        >
          <LogOut size={17} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={login}
        disabled={loading}
        className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 py-2 pl-4 pr-4 text-sm font-bold text-votely-purple hover:bg-violet-100 disabled:opacity-50"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-200">
          π
        </span>

        {loading ? "Connecting..." : "Connect Pi"}
      </button>

      {message && (
        <p className="max-w-56 text-right text-xs text-red-500">
          {message}
        </p>
      )}
    </div>
  );
}
