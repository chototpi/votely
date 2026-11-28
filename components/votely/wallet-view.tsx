"use client";

import { ArrowDownLeft, ArrowUpRight, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/votely/format";
import { AD_REWARD, POST_COST, useVotely, VOTE_COST } from "@/lib/votely/store";

export function WalletView() {
  const { vt, ledger, openAd } = useVotely();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">VT wallet</h1>
        <p className="text-sm text-muted-foreground">Votely points that power posting and voting.</p>
      </div>

      <section
        aria-label="Balance"
        className="flex flex-col gap-4 rounded-3xl bg-accent p-6 text-accent-foreground"
      >
        <span className="text-sm font-medium">Current balance</span>
        <p className="font-heading text-6xl font-extrabold tabular-nums">
          {vt}
          <span className="ml-2 text-2xl font-bold">VT</span>
        </p>
        <Button size="lg" onClick={openAd} className="w-full">
          <Tv className="size-5" aria-hidden="true" />
          Watch ad, earn {AD_REWARD} VT
        </Button>
      </section>

      <section aria-labelledby="how-heading" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <h2 id="how-heading" className="font-heading text-lg font-bold">
          How VT works
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex justify-between gap-3">
            <span>Watch an ad</span>
            <span className="font-semibold text-primary">+{AD_REWARD} VT</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>Cast a vote</span>
            <span className="font-semibold">{VOTE_COST} VT</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>Post a poll</span>
            <span className="font-semibold">from {POST_COST} VT</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>Boost a poll</span>
            <span className="font-semibold">1 VT each</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          VT is an in-app point only. It has no cash value, cannot be bought, and cannot be cashed out.
        </p>
      </section>

      <section aria-labelledby="activity-heading" className="flex flex-col gap-3">
        <h2 id="activity-heading" className="font-heading text-lg font-bold">
          Recent activity
        </h2>
        {ledger.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            {ledger.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  aria-hidden="true"
                  className={
                    entry.kind === "earn"
                      ? "flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary"
                      : "flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                  }
                >
                  {entry.kind === "earn" ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{entry.label}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(entry.at)}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {entry.kind === "earn" ? "+" : "-"}
                  {entry.amount} VT
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
