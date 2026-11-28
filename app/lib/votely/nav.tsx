"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Tab = "home" | "search" | "create" | "wallet" | "profile";
export type Route = { type: "poll"; id: string } | { type: "user"; name: string };

interface NavContextValue {
  tab: Tab;
  route: Route | null;
  setTab: (tab: Tab) => void;
  openPoll: (id: string) => void;
  openUser: (name: string) => void;
  back: () => void;
}

const NavContext = createContext<NavContextValue | undefined>(undefined);

interface Frame {
  route: Route;
  returnScroll: number;
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<Tab>("home");
  const [stack, setStack] = useState<Frame[]>([]);
  const pendingScroll = useRef<number | null>(0);

  const setTab = useCallback((next: Tab) => {
    setStack([]);
    pendingScroll.current = 0;
    setTabState(next);
  }, []);

  const push = useCallback((route: Route) => {
    setStack((current) => [...current, { route, returnScroll: window.scrollY }]);
    pendingScroll.current = 0;
  }, []);

  const back = useCallback(() => {
    setStack((current) => {
      if (current.length === 0) return current;
      pendingScroll.current = current[current.length - 1].returnScroll;
      return current.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    if (pendingScroll.current === null) return;
    const y = pendingScroll.current;
    pendingScroll.current = null;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [tab, stack]);

  const value = useMemo<NavContextValue>(
    () => ({
      tab,
      route: stack.length > 0 ? stack[stack.length - 1].route : null,
      setTab,
      openPoll: (id) => push({ type: "poll", id }),
      openUser: (name) => push({ type: "user", name }),
      back,
    }),
    [tab, stack, setTab, push, back],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNav must be used within NavProvider");
  return context;
}
