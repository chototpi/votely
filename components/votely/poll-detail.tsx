"use client";

import { ArrowLeft, Coins, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentThread } from "@/components/votely/comment-thread";
import { PollOptions } from "@/components/votely/poll-options";
import { UserLink } from "@/components/votely/user";
import { pluralize, timeAgo } from "@/lib/votely/format";
import { useNav } from "@/lib/votely/nav";
import { useVotely } from "@/lib/votely/store";
import { LIMITS } from "@/lib/votely/types";

export function BackBar({ label }: { label: string }) {
  const { back } = useNav();
  return (
    <div className="flex items-center gap-2 pb-3">
      <Button variant="ghost" size="icon" onClick={back} aria-label="Go back">
        <ArrowLeft className="size-5" />
      </Button>
      <span className="font-heading text-lg font-bold">{label}</span>
    </div>
  );
}

export function PollDetail({ pollId }: { pollId: string }) {
  const { pollsById, me, boostPoll } = useVotely();
  const poll = pollsById.get(pollId);

  if (!poll) {
    return (
      <div>
        <BackBar label="Poll" />
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          This poll is no longer available.
        </p>
      </div>
    );
  }

  const isOwn = poll.authorName === me;
  const votedOption = poll.options.find((o) => o.id === poll.myVote);

  function handleBoost() {
    const result = boostPoll(pollId, 1);
    if (!result.ok && result.reason !== "Not enough VT.") toast.error(result.reason);
  }

  return (
    <div className="flex flex-col gap-6">
      <BackBar label="Poll" />

      <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm">
        <header className="flex items-center justify-between gap-2">
          <UserLink name={poll.authorName} />
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            {poll.boost > 0 && (
              <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                <Rocket className="size-3" aria-hidden="true" />
                Boost {poll.boost}
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
          <h1 className="font-heading text-2xl font-bold leading-snug text-balance">{poll.question}</h1>
        </div>

        {poll.coverImage && <img src={poll.coverImage} alt="Poll cover" className="aspect-[16/9] w-full rounded-xl border object-cover" />}
        {poll.galleryImages && poll.galleryImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Poll image gallery">
            {poll.galleryImages.slice(0, 4).map((image, index) => <img key={`${poll.id}-detail-${index}`} src={image} alt={`Poll gallery ${index + 1}`} className="aspect-square w-full rounded-lg border object-cover" loading="lazy" />)}
          </div>
        )}

        <PollOptions poll={poll} />

        <div className="flex flex-col gap-1 text-sm text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground">{pluralize(poll.total, "vote")} so far</span>
          {votedOption ? (
            <span>You voted for &ldquo;{votedOption.text}&rdquo;.</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Coins className="size-4 text-accent-foreground" aria-hidden="true" />
              Voting is free. You can change your vote while this poll is open.
            </span>
          )}
        </div>

        {isOwn && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-3">
            <p className="text-sm text-secondary-foreground">
              Spend 1 VT to push your poll higher in the feed.
            </p>
            <Button
              size="sm"
              onClick={handleBoost}
              disabled={poll.boost >= LIMITS.maxBoost}
              className="shrink-0"
            >
              <Rocket className="size-4" aria-hidden="true" />
              Boost
            </Button>
          </div>
        )}
      </article>

      <CommentThread pollId={pollId} />
    </div>
  );
}
