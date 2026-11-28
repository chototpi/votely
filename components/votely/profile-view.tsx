"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, ClipboardList, MessageCircle, Plus, Rocket, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PollCard } from "@/components/votely/poll-card";
import { BackBar } from "@/components/votely/poll-detail";
import { UserAvatar } from "@/components/votely/user";
import { formatCount } from "@/lib/votely/format";
import { useNav } from "@/lib/votely/nav";
import { useVotely } from "@/lib/votely/store";
import { cn } from "@/lib/utils";

type ProfileTab = "created" | "voted";
type StatusFilter = "all" | "open" | "closed";

export function ProfileView({ name, showBack = false }: { name: string; showBack?: boolean }) {
  const { polls, comments, me, vt } = useVotely();
  const { setTab, openPoll } = useNav();
  const isMe = name === me;
  const [activeTab, setActiveTab] = useState<ProfileTab>("created");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const authored = useMemo(
    () => polls.filter((poll) => poll.authorName === name).sort((a, b) => b.createdAt - a.createdAt),
    [polls, name],
  );
  const voted = useMemo(
    () => polls.filter((poll) => poll.myVote !== null).sort((a, b) => b.createdAt - a.createdAt),
    [polls],
  );
  const votesReceived = authored.reduce((sum, poll) => sum + poll.total, 0);
  const commentCount = comments.filter((comment) => comment.authorName === name).length;
  const activePolls = authored.filter((poll) => !poll.isClosed).length;
  const closedPolls = authored.length - activePolls;

  const currentItems = (activeTab === "created" ? authored : voted).filter((poll) => {
    if (statusFilter === "open") return !poll.isClosed;
    if (statusFilter === "closed") return poll.isClosed;
    return true;
  });

  const stats = [
    { label: "Polls created", value: authored.length, icon: ClipboardList },
    { label: "Votes received", value: votesReceived, icon: Vote },
    { label: "Comments", value: commentCount, icon: MessageCircle },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {showBack && <BackBar label="Profile" />}

      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-sky-400/20" />
        <div className="-mt-10 flex flex-col items-center px-5 pb-5 text-center">
          <div className="rounded-full border-4 border-card bg-card">
            <UserAvatar name={name} size="lg" />
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold">{name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{isMe ? "Your Votely profile" : "Pioneer on Votely"}</p>
          {isMe && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Your account</Badge>
              <Badge variant="outline">{vt} VT balance</Badge>
            </div>
          )}
          {isMe && (
            <Button className="mt-4 rounded-full" onClick={() => setTab("create")}>
              <Plus className="mr-1 size-4" /> Create a poll
            </Button>
          )}
        </div>
      </section>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex min-w-0 flex-col items-center rounded-2xl border bg-card p-3 text-center">
            <Icon className="mb-1 size-4 text-primary" aria-hidden="true" />
            <dd className="font-heading text-xl font-bold tabular-nums">{formatCount(value)}</dd>
            <dt className="text-[11px] leading-tight text-muted-foreground sm:text-xs">{label}</dt>
          </div>
        ))}
      </dl>

      {isMe && (
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-card p-3">
            <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="size-4" /><span className="text-xs font-semibold">Open polls</span></div>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{activePolls}</p>
          </div>
          <div className="rounded-2xl border bg-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="size-4" /><span className="text-xs font-semibold">Closed polls</span></div>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{closedPolls}</p>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4" aria-labelledby="profile-polls-heading">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{isMe ? "YOUR ACTIVITY" : "COMMUNITY ACTIVITY"}</p>
            <h2 id="profile-polls-heading" className="font-heading text-xl font-bold">{isMe ? "Poll management" : "Polls"}</h2>
          </div>
          <span className="text-xs text-muted-foreground">{activeTab === "created" ? authored.length : voted.length} items</span>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl border bg-muted/60 p-1" role="tablist" aria-label="Profile poll lists">
          <button type="button" role="tab" aria-selected={activeTab === "created"} onClick={() => { setActiveTab("created"); setStatusFilter("all"); }} className={cn("rounded-lg px-3 py-2 text-sm font-semibold", activeTab === "created" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            <ClipboardList className="mr-1 inline size-4" /> {isMe ? "Polls created" : "Posts"}
          </button>
          {isMe ? (
            <button type="button" role="tab" aria-selected={activeTab === "voted"} onClick={() => { setActiveTab("voted"); setStatusFilter("all"); }} className={cn("rounded-lg px-3 py-2 text-sm font-semibold", activeTab === "voted" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              <Vote className="mr-1 inline size-4" /> Polls voted
            </button>
          ) : (
            <div className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-muted-foreground">Public activity</div>
          )}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Filter polls by status">
          {([
            ["all", "All"],
            ["open", "Open"],
            ["closed", "Closed"],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={statusFilter === value} onClick={() => setStatusFilter(value)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", statusFilter === value ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>

        {currentItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
            <ClipboardList className="mx-auto size-8 text-muted-foreground/50" />
            <h3 className="mt-3 font-semibold">{activeTab === "created" ? "No polls created yet" : "No votes yet"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "created" ? "Create a poll to start a conversation with the community." : "Explore polls and cast your first vote."}
            </p>
            {isMe && activeTab === "created" && <Button className="mt-4 rounded-full" onClick={() => setTab("create")}><Plus className="mr-1 size-4" /> Create a poll</Button>}
            {!isMe && <p className="mt-2 text-xs text-muted-foreground">No public activity to show.</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {currentItems.map((poll) => (
              <div key={`${activeTab}-${poll.id}`} className="flex flex-col gap-2">
                {isMe && activeTab === "created" && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {poll.isClosed ? <Badge variant="secondary">Closed</Badge> : <Badge variant="outline" className="text-emerald-600">Open</Badge>}
                      <span>{poll.total.toLocaleString()} votes</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Rocket className="size-3" /> {poll.boost} VT promotion</span>
                  </div>
                )}
                <PollCard poll={poll} />
                {isMe && activeTab === "created" && (
                  <div className="flex flex-wrap justify-end gap-2 px-1">
                    <Button variant="outline" size="sm" onClick={() => openPoll(poll.id)}>Manage poll</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <p className="text-center text-[11px] text-muted-foreground">Poll management actions are available inside each poll. Deletion and editing are not enabled in this preview.</p>
    </div>
  );
}
