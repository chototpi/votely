"use client";

import { useMemo } from "react";
import { PollCard } from "@/components/votely/poll-card";
import { BackBar } from "@/components/votely/poll-detail";
import { UserAvatar } from "@/components/votely/user";
import { formatCount } from "@/lib/votely/format";
import { useVotely } from "@/lib/votely/store";

export function ProfileView({ name, showBack = false }: { name: string; showBack?: boolean }) {
  const { polls, comments, me } = useVotely();
  const isMe = name === me;

  const { authored, votesReceived, commentCount, votedCount } = useMemo(() => {
    const own = polls.filter((p) => p.authorName === name).sort((a, b) => b.createdAt - a.createdAt);
    return {
      authored: own,
      votesReceived: own.reduce((sum, p) => sum + p.total, 0),
      commentCount: comments.filter((c) => c.authorName === name).length,
      votedCount: polls.filter((p) => p.myVote !== null).length,
    };
  }, [polls, comments, name]);

  const stats = [
    { label: "Polls", value: authored.length },
    { label: "Votes received", value: votesReceived },
    { label: "Comments", value: commentCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      {showBack && <BackBar label="Profile" />}

      <header className="flex flex-col items-center gap-3 text-center">
        <UserAvatar name={name} size="lg" />
        <div>
          <h1 className="font-heading text-2xl font-bold">{name}</h1>
          <p className="text-sm text-muted-foreground">
            {isMe ? `You · voted on ${votedCount} ${votedCount === 1 ? "poll" : "polls"}` : "Pioneer"}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center rounded-2xl border bg-card p-3">
            <dd className="font-heading text-xl font-bold tabular-nums">{formatCount(stat.value)}</dd>
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <section aria-labelledby="posted-heading" className="flex flex-col gap-4">
        <h2 id="posted-heading" className="font-heading text-lg font-bold">
          {isMe ? "Your polls" : "Polls"}
        </h2>
        {authored.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            {isMe ? "You haven't posted a poll yet. Tap + to create your first." : "No polls yet."}
          </p>
        ) : (
          authored.map((poll) => <PollCard key={poll.id} poll={poll} />)
        )}
      </section>
    </div>
  );
}
