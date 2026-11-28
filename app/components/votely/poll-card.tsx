"use client";

import { Clock3, MessageCircle, Rocket, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PollOptions } from "@/components/votely/poll-options";
import { UserLink } from "@/components/votely/user";
import { pluralize, timeAgo } from "@/lib/votely/format";
import { useNav } from "@/lib/votely/nav";
import type { PollView } from "@/lib/votely/types";

export function PollCard({ poll }: { poll: PollView }) {
  const { openPoll } = useNav();

  return (
    <article id={`poll-${poll.id}`} className="animate-reveal-up group flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <header className="flex items-center justify-between gap-2">
        <UserLink name={poll.authorName} />
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          {poll.boost > 0 && (
            <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
              <Rocket className="size-3" aria-hidden="true" />
              Sponsored
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
        <h2 className="font-heading text-lg font-bold leading-snug text-balance sm:text-xl">
          <button type="button" onClick={() => openPoll(poll.id)} className="text-left">
            {poll.question}
          </button>
        </h2>
      </div>

      {poll.coverImage && (
        <button type="button" onClick={() => openPoll(poll.id)} className="group/media overflow-hidden rounded-xl border bg-muted text-left" aria-label="Open poll with cover image">
          <img src={poll.coverImage} alt="Poll cover" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover/media:scale-[1.02]" />
        </button>
      )}
      {poll.galleryImages && poll.galleryImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Poll image gallery">
          {poll.galleryImages.slice(0, 4).map((image, index) => (
            <button key={`${poll.id}-gallery-${index}`} type="button" onClick={() => openPoll(poll.id)} className="w-24 shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-28" aria-label={`Open poll gallery image ${index + 1}`}>
              <img src={image} alt={`Poll gallery ${index + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <PollOptions poll={poll} />

      <footer className="flex items-center justify-between gap-3 border-t pt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Vote className="size-3.5" aria-hidden="true" />
          {pluralize(poll.total, "vote")}
          {poll.myVote ? " · You voted" : ""}
        </span>
        <button
          type="button"
          onClick={() => openPoll(poll.id)}
          className="flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-secondary hover:text-foreground"
        >
          <MessageCircle className="size-3.5" aria-hidden="true" />
          {pluralize(poll.commentCount, "comment")}
        </button>
      </footer>
    </article>
  );
}
