"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PollCard } from "@/components/votely/poll-card";
import { cn } from "@/lib/utils";
import { useVotely } from "@/lib/votely/store";
import { CATEGORIES, type Category } from "@/lib/votely/types";

const PAGE_SIZE = 5;
const PULL_THRESHOLD = 56;

type Filter = Category | "All";

export function FeedView() {
  const { polls, pollsById, rankVersion, refresh } = useVotely();
  const [filter, setFilter] = useState<Filter>("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStart = useRef<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  // The order is only recomputed on refresh or new posts so cards don't jump while live votes arrive.
  const order = useMemo(
    () => [...polls].sort((a, b) => b.score - a.score).map((p) => p.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rankVersion, polls.length],
  );

  const items = useMemo(
    () =>
      order
        .map((id) => pollsById.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .filter((p) => filter === "All" || p.category === filter),
    [order, pollsById, filter],
  );

  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((v) => v + PAGE_SIZE);
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visible]);

  async function runRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    setPull(PULL_THRESHOLD);
    await refresh();
    setVisible(PAGE_SIZE);
    setRefreshing(false);
    setPull(0);
  }

  function onTouchStart(event: React.TouchEvent) {
    touchStart.current = window.scrollY <= 0 ? event.touches[0].clientY : null;
  }

  function onTouchMove(event: React.TouchEvent) {
    if (touchStart.current === null || refreshing) return;
    const distance = event.touches[0].clientY - touchStart.current;
    setPull(distance > 0 ? Math.min(distance * 0.5, 80) : 0);
  }

  function onTouchEnd() {
    const shouldRefresh = pull >= PULL_THRESHOLD && !refreshing;
    touchStart.current = null;
    if (shouldRefresh) void runRefresh();
    else if (!refreshing) setPull(0);
  }

  function pickFilter(next: Filter) {
    setFilter(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden text-xs text-muted-foreground transition-[height] duration-200"
        style={{ height: pull }}
        aria-hidden={pull === 0}
      >
        {refreshing ? (
          <RefreshCw className="mr-2 size-4 animate-spin" />
        ) : (
          <ArrowDown
            className={cn("mr-2 size-4 transition-transform", pull >= PULL_THRESHOLD && "rotate-180")}
          />
        )}
        {refreshing ? "Loading the latest polls" : pull >= PULL_THRESHOLD ? "Release to refresh" : "Pull to refresh"}
      </div>

      <div className="flex items-center justify-between gap-2 pb-3">
        <h1 className="font-heading text-2xl font-bold">Latest polls</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void runRefresh()}
          disabled={refreshing}
          aria-label="Refresh the feed"
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
        </Button>
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 [scrollbar-width:none]"
      >
        {(["All", ...CATEGORIES] as Filter[]).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => pickFilter(category)}
            aria-pressed={filter === category}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === category
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {shown.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
        {shown.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No polls in this category yet. Be the first to post one.
          </p>
        )}
      </div>

      {hasMore ? (
        <div ref={sentinel} className="flex justify-center py-6" role="status" aria-label="Loading more polls">
          <RefreshCw className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        shown.length > 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
        )
      )}
    </div>
  );
}
