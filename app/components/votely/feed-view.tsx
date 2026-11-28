"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Compass, Flame, Plus, RefreshCw, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PollCard } from "@/components/votely/poll-card";
import { useNav } from "@/lib/votely/nav";
import { useVotely } from "@/lib/votely/store";
import { CATEGORIES, type Category, type PollView } from "@/lib/votely/types";
import { cn } from "@/lib/utils";

type FeedMode = "for-you" | "trending" | "latest";
type CategoryFilter = Category | "All";
const PAGE_SIZE = 5;
const PULL_THRESHOLD = 56;

function organicTrendingScore(poll: PollView, now: number) {
  const ageHours = Math.max(0, (now - poll.createdAt) / 3_600_000);
  // Promotion is excluded from organic ranking; sponsored polls have a separate section.
  return poll.total + poll.commentCount * 4 + Math.max(0, 72 - ageHours) * 3
    + Math.max(0, 12 - ageHours) * 150;
}

function SectionHeading({ eyebrow, title, description, icon: Icon }: {
  eyebrow: string; title: string; description?: string; icon: typeof Sparkles;
}) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h2 className="font-heading text-lg font-bold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function FeedView() {
  const { polls, rankVersion, refresh } = useVotely();
  const { setTab, openPoll } = useNav();
  const [mode, setMode] = useState<FeedMode>("for-you");
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStart = useRef<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const sponsored = useMemo(
    () => polls.filter((poll) => poll.boost > 0).sort((a, b) => b.boost - a.boost || b.createdAt - a.createdAt),
    [polls],
  );

  const organic = useMemo(() => {
    const items = polls.filter((poll) => poll.boost <= 0);
    if (mode === "latest") return [...items].sort((a, b) => b.createdAt - a.createdAt);
    if (mode === "trending") {
      const now = Date.now();
      return [...items].sort((a, b) => organicTrendingScore(b, now) - organicTrendingScore(a, now));
    }
    return [...items].sort((a, b) => b.score - a.score);
  }, [polls, mode, rankVersion]);

  const filtered = useMemo(
    () => organic.filter((poll) => filter === "All" || poll.category === filter),
    [organic, filter],
  );
  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;
  const trendingPreview = useMemo(() => {
    const now = Date.now();
    return [...polls].filter((poll) => poll.boost <= 0)
      .sort((a, b) => organicTrendingScore(b, now) - organicTrendingScore(a, now)).slice(0, 3);
  }, [polls, rankVersion]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisible((current) => current + PAGE_SIZE);
    }, { rootMargin: "320px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visible]);

  async function runRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    setPull(PULL_THRESHOLD);
    try {
      await refresh();
      setVisible(PAGE_SIZE);
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  }

  function onTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStart.current = window.scrollY <= 0 ? event.touches[0]?.clientY ?? null : null;
  }
  function onTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStart.current === null || refreshing) return;
    const distance = (event.touches[0]?.clientY ?? touchStart.current) - touchStart.current;
    setPull(distance > 0 ? Math.min(distance * 0.5, 80) : 0);
  }
  function onTouchEnd() {
    const shouldRefresh = pull >= PULL_THRESHOLD && !refreshing;
    touchStart.current = null;
    if (shouldRefresh) void runRefresh();
    else if (!refreshing) setPull(0);
  }
  function changeMode(next: FeedMode) { setMode(next); setVisible(PAGE_SIZE); }
  function changeFilter(next: CategoryFilter) { setFilter(next); setVisible(PAGE_SIZE); }

  return (
    <div className="mx-auto w-full max-w-6xl" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-center overflow-hidden text-xs text-muted-foreground transition-[height] duration-200"
        style={{ height: pull }} aria-hidden={pull === 0}>
        <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} />
        {refreshing ? "Refreshing polls…" : "Release to refresh"}
      </div>

      <section className="relative mb-5 overflow-hidden rounded-3xl border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-10 -top-16 size-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 size-44 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-[11px] font-semibold text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" /> A WORLD OF PERSPECTIVES
            </div>
            <h1 className="max-w-xl font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-4xl">
              Every opinion adds a new perspective.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Ask a question, share your point of view, and discover what the community thinks.
            </p>
          </div>
          <Button onClick={() => setTab("create")} className="h-11 shrink-0 gap-2 rounded-full px-5">
            <Plus className="size-4" aria-hidden="true" /> Create a poll
          </Button>
        </div>
        <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" /> Community-powered</span>
          <span className="inline-flex items-center gap-1.5"><Compass className="size-3.5" /> Global conversations</span>
          <span className="inline-flex items-center gap-1.5"><TrendingUp className="size-3.5" /> Your voice matters</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
        <section className="min-w-0">
          {sponsored.length > 0 && (
            <section className="mb-7" aria-label="Sponsored polls">
              <SectionHeading eyebrow="Paid visibility" title="Sponsored polls"
                description="Promoted by their creators. Shown separately from organic rankings." icon={Sparkles} />
              <div className="flex flex-col gap-4">
                {sponsored.slice(0, 2).map((poll) => <PollCard key={poll.id} poll={poll} />)}
              </div>
            </section>
          )}

          <section aria-labelledby="community-feed-heading">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">COMMUNITY FEED</p>
                <h2 id="community-feed-heading" className="font-heading text-xl font-bold tracking-tight sm:text-2xl">Discover conversations</h2>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => void runRefresh()}
                disabled={refreshing} aria-label="Refresh the feed" className="shrink-0 rounded-full">
                <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
              </Button>
            </div>

            <div className="mb-4 flex gap-1 rounded-xl border bg-muted/60 p-1" role="tablist" aria-label="Feed sort">
              {([["for-you", "For you"], ["trending", "Trending"], ["latest", "Latest"]] as const).map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => changeMode(id)}
                  className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    mode === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {label}
                </button>
              ))}
            </div>

            <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
              {(["All", ...CATEGORIES] as CategoryFilter[]).map((category) => (
                <button key={category} type="button" onClick={() => changeFilter(category)} aria-pressed={filter === category}
                  className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    filter === category ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {shown.map((poll) => <PollCard key={poll.id} poll={poll} />)}
              {shown.length === 0 && (
                <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
                  <Compass className="mx-auto size-8 text-muted-foreground/60" />
                  <h3 className="mt-3 font-semibold">No polls here yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try another topic or start a conversation.</p>
                  <Button onClick={() => setTab("create")} variant="outline" className="mt-4 rounded-full">Create a poll</Button>
                </div>
              )}
            </div>
            {hasMore ? (
              <div ref={sentinel} className="flex justify-center py-6" role="status" aria-label="Loading more polls">
                <RefreshCw className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : shown.length > 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>
            ) : null}
          </section>
        </section>

        <aside className="hidden space-y-4 lg:block">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-primary"><Users className="size-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]">The Votely community</p></div>
            <h2 className="mt-3 font-heading text-xl font-bold">Curiosity connects us.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Every poll is a chance to learn something new from someone new.</p>
            <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span>Polls to explore</span><span className="font-semibold text-foreground">{polls.length.toLocaleString()}</span>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading font-bold"><Flame className="size-4 text-orange-500" /> Trending now</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Organic</span>
            </div>
            <div className="space-y-4">
              {trendingPreview.map((poll, index) => (
                <button key={poll.id} type="button" onClick={() => openPoll(poll.id)} className="flex w-full items-start gap-3 text-left">
                  <span className="font-heading text-lg font-bold text-primary/50">0{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm font-semibold">{poll.question}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{poll.total.toLocaleString()} votes · {poll.category ?? "General"}</span>
                  </span>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-heading font-bold">Explore topics</h2>
            <p className="mt-1 text-xs text-muted-foreground">Find conversations that interest you.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button key={category} type="button" onClick={() => {
                  changeFilter(category);
                  document.getElementById("community-feed-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }} className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  {category}
                </button>
              ))}
            </div>
          </section>

          <footer className="px-2 text-[11px] leading-6 text-muted-foreground">
            <span>About</span><span className="px-2">·</span><span>Community guidelines</span><span className="px-2">·</span><span>Privacy</span>
            <p>© 2026 Votely</p>
          </footer>
        </aside>
      </div>
    </div>
  );
}
