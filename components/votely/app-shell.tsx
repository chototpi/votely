"use client";

import { Check, Coins, House, PlusCircle, Search, User } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { CreateView } from "@/components/votely/create-view";
import { FeedView } from "@/components/votely/feed-view";
import { AdDialog, EarnPromptDrawer, VoteConfirmDrawer } from "@/components/votely/overlays";
import { PollDetail } from "@/components/votely/poll-detail";
import { ProfileView } from "@/components/votely/profile-view";
import { SearchView } from "@/components/votely/search-view";
import { WalletView } from "@/components/votely/wallet-view";
import { cn } from "@/lib/utils";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { NavProvider, useNav, type Tab } from "@/lib/votely/nav";
import { useVotely, VotelyProvider } from "@/lib/votely/store";

const TABS: { id: Tab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "search", label: "Search", icon: Search },
  { id: "create", label: "Create", icon: PlusCircle },
  { id: "wallet", label: "Wallet", icon: Coins },
  { id: "profile", label: "Profile", icon: User },
];

function VtChip() {
  const { vt, flash } = useVotely();
  const { setTab } = useNav();

  return (
    <button
      type="button"
      onClick={() => setTab("wallet")}
      aria-label={`Your balance is ${vt} VT. Open wallet`}
      className="relative flex items-center gap-2 rounded-full bg-accent py-1.5 pl-2 pr-3.5 text-accent-foreground"
    >
      <Coins className="size-4" aria-hidden="true" />
      <span key={vt} className="animate-vt-pop font-heading text-sm font-bold tabular-nums">
        {vt} VT
      </span>
      {flash && (
        <span
          key={flash.id}
          aria-hidden="true"
          className={cn(
            "animate-float-up pointer-events-none absolute -bottom-1 right-2 text-sm font-bold",
            flash.delta > 0 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {flash.delta > 0 ? `+${flash.delta}` : flash.delta}
        </span>
      )}
    </button>
  );
}

function Header() {
  const { setTab } = useNav();
  const { user, isAuthenticated, isLoading, login, logout } = usePiAuth();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-2 px-4">
        <button
          type="button"
          onClick={() => setTab("home")}
          className="flex items-center gap-2"
          aria-label="Votely home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Check className="size-5" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="font-heading text-xl font-extrabold">Votely</span>
        </button>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="max-w-24 truncate text-xs font-semibold text-muted-foreground">@{user?.username}</span>
              <button type="button" onClick={logout} className="rounded-full border px-3 py-1.5 text-xs font-semibold">
                Đăng xuất
              </button>
              <VtChip />
            </>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void login()}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isLoading ? "Đang tải..." : "Đăng nhập Pi"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const { tab, route, setTab } = useNav();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex h-16 w-full max-w-xl items-center justify-around px-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id && !route;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => setTab(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-6", id === "create" && "size-7")} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CurrentView() {
  const { tab, route } = useNav();
  const { me } = useVotely();

  if (route?.type === "poll") return <PollDetail key={route.id} pollId={route.id} />;
  if (route?.type === "user") return <ProfileView key={route.name} name={route.name} showBack />;

  switch (tab) {
    case "home":
      return <FeedView />;
    case "search":
      return <SearchView />;
    case "create":
      return <CreateView />;
    case "wallet":
      return <WalletView />;
    case "profile":
      return <ProfileView name={me} />;
  }
}

function Shell() {
  const { status, retryLoad } = useVotely();

  if (status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6" role="status" aria-label="Loading Votely">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-heading text-2xl font-bold">We couldn&apos;t load your data</h1>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again. Your polls and VT are safe.
        </p>
        <Button onClick={retryLoad}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
        <CurrentView />
      </main>
      <BottomNav />
      <VoteConfirmDrawer />
      <EarnPromptDrawer />
      <AdDialog />
      <Toaster position="top-center" />
    </div>
  );
}

export function VotelyApp() {
  return (
    <NavProvider>
      <VotelyProvider>
        <Shell />
      </VotelyProvider>
    </NavProvider>
  );
}
