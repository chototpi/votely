"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import type { PiAuthResult, SDKLiteInstance, Product, UserPurchaseBalance } from "@/lib/sdklite-types";

const TOKEN_KEY = "votely_pi_access_token";
const USER_KEY = "votely_pi_user";
const VERIFIED_AT_KEY = "votely_pi_verified_at";
const OAUTH_STATE_KEY = "votely_pi_oauth_state";

export interface VotelyUser {
  uid: string;
  username: string;
}
interface AuthResult {
  success: boolean;
  user?: VotelyUser;
  balance?: number;
  error?: string;
}
interface PiAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMessage: string;
  hasError: boolean;
  user: VotelyUser | null;
  accessToken: string | null;
  sdk: SDKLiteInstance | null;
  products: Product[] | null;
  restoredPurchases: UserPurchaseBalance[] | null;
  login: () => Promise<void>;
  completeLogin: (token: string, expectedState?: string | null) => Promise<void>;
  logout: () => void;
  reinitialize: () => Promise<void>;
}
const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

function loadPiSDK(): Promise<void> {
  if (window.Pi) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không tải được Pi SDK. Vui lòng thử lại."));
    document.head.appendChild(script);
  });
}

async function verifyAndSync(token: string): Promise<AuthResult> {
  const response = await fetch("/api/auth/pi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: token }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Không thể xác minh tài khoản Pi.");
  }
  return data;
}

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VotelyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [hasError, setHasError] = useState(false);

  const acceptToken = useCallback(async (token: string) => {
    setIsLoading(true);
    setHasError(false);
    setAuthMessage("Đang xác minh tài khoản Pi...");
    try {
      const result = await verifyAndSync(token);
      if (!result.user) throw new Error("Backend không trả về thông tin người dùng.");
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      localStorage.setItem(VERIFIED_AT_KEY, String(Date.now()));
      setAccessToken(token);
      setUser(result.user);
      setAuthMessage("");
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(VERIFIED_AT_KEY);
      setAccessToken(null);
      setUser(null);
      setHasError(true);
      setAuthMessage(error instanceof Error ? error.message : "Đăng nhập thất bại.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeLogin = useCallback(async (token: string, expectedState?: string | null) => {
    if (expectedState !== undefined) {
      const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      if (!storedState || expectedState !== storedState) {
        throw new Error("Xác thực OAuth không hợp lệ (state không khớp).");
      }
    }
    await acceptToken(token);
  }, [acceptToken]);

  const login = useCallback(async () => {
    setHasError(false);
    setAuthMessage("");
    if (typeof window === "undefined") return;

    // Pi Browser: authenticate with the native Pi SDK.
    const isPiBrowser = /PiBrowser/i.test(navigator.userAgent);
    if (isPiBrowser) {
      setIsLoading(true);
      try {
        await loadPiSDK();
        if (!window.Pi) throw new Error("Pi SDK chưa sẵn sàng trong Pi Browser.");
        await window.Pi.init({ version: "2.0", sandbox: PI_NETWORK_CONFIG.SANDBOX });
        const result: PiAuthResult = await window.Pi.authenticate(
          ["username"],
          (payment) => console.warn("[Votely] Incomplete Pi payment:", payment),
        );
        await acceptToken(result.accessToken);
      } catch (error) {
        setIsLoading(false);
        setHasError(true);
        setAuthMessage(error instanceof Error ? error.message : "Đăng nhập Pi thất bại.");
      }
      return;
    }

    // Standard browser: Pi Sign-In OAuth implicit flow.
    const state = crypto.randomUUID();
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
    const url = new URL("https://accounts.pinet.com/oauth/authorize");
    url.searchParams.set("response_type", "token");
    url.searchParams.set("client_id", PI_NETWORK_CONFIG.CLIENT_ID);
    url.searchParams.set("redirect_uri", PI_NETWORK_CONFIG.REDIRECT_URI);
    url.searchParams.set("scope", "username");
    url.searchParams.set("state", state);
    window.location.assign(url.toString());
  }, [acceptToken]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(VERIFIED_AT_KEY);
    setAccessToken(null);
    setUser(null);
    setHasError(false);
    setAuthMessage("");
  }, []);

  const reinitialize = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      await acceptToken(token);
    } catch {
      // acceptToken already clears invalid/expired credentials and exposes the error.
    }
  }, [acceptToken]);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    const verifiedAt = Number(localStorage.getItem(VERIFIED_AT_KEY) || 0);
    const cachedUserRaw = localStorage.getItem(USER_KEY);
    if (cachedUserRaw && Date.now() - verifiedAt < 5 * 60 * 1000) {
      try {
        const cachedUser = JSON.parse(cachedUserRaw) as VotelyUser;
        if (cachedUser.uid && cachedUser.username) {
          setUser(cachedUser);
          setAccessToken(token);
          setIsLoading(false);
          return;
        }
      } catch {
        // Invalid cached profile: verify the token again below.
      }
    }
    verifyAndSync(token).then((result) => {
      if (cancelled) return;
      if (!result.user) throw new Error("Thông tin tài khoản không hợp lệ.");
      setUser(result.user);
      setAccessToken(token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      localStorage.setItem(VERIFIED_AT_KEY, String(Date.now()));
    }).catch((error) => {
      if (cancelled) return;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(VERIFIED_AT_KEY);
      setAccessToken(null);
      setUser(null);
      setHasError(true);
      setAuthMessage(error instanceof Error ? error.message : "Phiên Pi đã hết hạn. Vui lòng đăng nhập lại.");
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(user && accessToken),
    isLoading,
    authMessage,
    hasError,
    user,
    accessToken,
    sdk: null,
    products: null,
    restoredPurchases: null,
    login,
    completeLogin,
    logout,
    reinitialize,
  }), [user, accessToken, isLoading, authMessage, hasError, login, completeLogin, logout, reinitialize]);

  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>;
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (!context) throw new Error("usePiAuth must be used within a PiAuthProvider");
  return context;
}
