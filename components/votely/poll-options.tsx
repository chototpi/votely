"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/votely/format";
import { useVotely } from "@/lib/votely/store";
import type { PollView } from "@/lib/votely/types";

export function PollOptions({ poll }: { poll: PollView }) {
  const { requestVote } = useVotely();
  const hasVoted = poll.myVote !== null;
  const leadingVotes = Math.max(...poll.options.map((o) => o.votes));

  return (
    <ul className="flex flex-col gap-2">
      {poll.options.map((option) => {
        const isMine = poll.myVote === option.id;
        const isLeading = option.votes === leadingVotes && poll.total > 0;
        return (
          <li key={option.id}>
            <button
              type="button"
              disabled={hasVoted}
              onClick={() => requestVote(poll.id, option.id)}
              aria-label={
                hasVoted
                  ? `${option.text}: ${option.percent} percent${isMine ? ", your vote" : ""}`
                  : `Vote for ${option.text}`
              }
              className={cn(
                "relative w-full overflow-hidden rounded-xl border bg-card text-left transition-colors",
                !hasVoted && "hover:border-primary/60 active:scale-[0.99]",
                isMine && "border-primary",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 transition-[width] duration-700 ease-out",
                  isMine ? "bg-primary/25" : "bg-secondary",
                )}
                style={{ width: `${option.percent}%` }}
              />
              <span className="relative flex items-center gap-3 px-3.5 py-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    isMine
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40",
                    hasVoted && !isMine && "border-transparent",
                  )}
                >
                  {isMine && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-pretty text-sm",
                    (isMine || isLeading) && "font-semibold",
                  )}
                >
                  {option.text}
                </span>
                <span className="flex shrink-0 flex-col items-end leading-tight">
                  <span className="text-sm font-semibold tabular-nums">{option.percent}%</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatCount(option.votes)}
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
