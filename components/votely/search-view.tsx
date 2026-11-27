"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/votely/user";
import { pluralize } from "@/lib/votely/format";
import { useNav } from "@/lib/votely/nav";
import { useVotely } from "@/lib/votely/store";
import type { PollView } from "@/lib/votely/types";

function PollRow({ poll }: { poll: PollView }) {
  const { openPoll } = useNav();
  return (
    <li>
      <button
        type="button"
        onClick={() => openPoll(poll.id)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/60"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-medium text-pretty">{poll.question}</span>
          <span className="text-xs text-muted-foreground">
            {poll.category ? `${poll.category} · ` : ""}
            {pluralize(poll.total, "vote")} · by {poll.authorName}
          </span>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  );
}

function PersonRow({ name, pollCount }: { name: string; pollCount: number }) {
  const { openUser } = useNav();
  return (
    <li>
      <button
        type="button"
        onClick={() => openUser(name)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/60"
      >
        <UserAvatar name={name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{pluralize(pollCount, "poll")}</span>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  );
}

export function SearchView() {
  const { polls, knownUsers } = useVotely();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const pollCounts = useMemo(() => {
    const counts = new Map<string, number>();
    polls.forEach((p) => counts.set(p.authorName, (counts.get(p.authorName) ?? 0) + 1));
    return counts;
  }, [polls]);

  const matchedPolls = useMemo(
    () =>
      (term
        ? polls.filter((p) => p.question.toLowerCase().includes(term))
        : [...polls].sort((a, b) => b.score - a.score).slice(0, 6)),
    [polls, term],
  );

  const matchedUsers = useMemo(
    () => (term ? knownUsers.filter((u) => u.toLowerCase().includes(term)) : knownUsers.slice(0, 5)),
    [knownUsers, term],
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">Search</h1>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search polls and people"
          aria-label="Search polls and people"
          className="h-11 bg-card pl-9"
        />
      </div>

      <section aria-labelledby="people-heading" className="flex flex-col gap-2">
        <h2 id="people-heading" className="text-sm font-semibold text-muted-foreground">
          {term ? "People" : "Active pioneers"}
        </h2>
        {matchedUsers.length > 0 ? (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {matchedUsers.map((name) => (
              <PersonRow key={name} name={name} pollCount={pollCounts.get(name) ?? 0} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            No people match &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </section>

      <section aria-labelledby="polls-heading" className="flex flex-col gap-2">
        <h2 id="polls-heading" className="text-sm font-semibold text-muted-foreground">
          {term ? "Polls" : "Trending polls"}
        </h2>
        {matchedPolls.length > 0 ? (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {matchedPolls.map((poll) => (
              <PollRow key={poll.id} poll={poll} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            No polls match &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </section>
    </div>
  );
}
