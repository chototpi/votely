"use client";

import { MessageCircle, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PollOptions } from "@/components/votely/poll-options";
import { UserLink } from "@/components/votely/user";
import { pluralize, timeAgo } from "@/lib/votely/format";
import { useNav } from "@/lib/votely/nav";
import type { PollView } from "@/lib/votely/types";

export function PollCard({ poll }: { poll: PollView }) {
  const { openPoll } = useNav();

  return (
    <article className="animate-reveal-up flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <UserLink name={poll.authorName} />
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          {poll.boost > 0 && (
            <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
              <Rocket className="size-3" aria-hidden="true" />
              Boosted
            </Badge>
          )}
          <time dateTime={new Date(poll.createdAt).toISOString()}>{timeAgo(poll.createdAt)}</time>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        {poll.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {poll.category}
          </span>
        )}
        <h2 className="font-heading text-lg font-bold leading-snug text-balance">
          <button type="button" onClick={() => openPoll(poll.id)} className="text-left">
            {poll.question}
          </button>
        </h2>
      </div>

      <PollOptions poll={poll} />

      <footer className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {pluralize(poll.total, "vote")}
          {poll.myVote ? " · You voted" : ""}
        </span>
        <button
          type="button"
          onClick={() => openPoll(poll.id)}
          className="flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-secondary hover:text-foreground"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {pluralize(poll.commentCount, "comment")}
        </button>
      </footer>
    </article>
  );
}
