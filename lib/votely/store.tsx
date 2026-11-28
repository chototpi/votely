"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { createSaver, loadSlices, type Slice } from "./persist";
import { SEED_COMMENTS, SEED_POLLS, SEED_USERS } from "./seed";
import {
  CATEGORIES,
  LIMITS,
  type ActionResult,
  type LedgerEntry,
  type NewPollInput,
  type Poll,
  type PollComment,
  type PollView,
} from "./types";

export const VOTE_COST = 0;
export const POST_COST = 1;
export const AD_REWARD = 1;
const WELCOME_VT = 3;

interface Data {
  vt: number;
  ledger: LedgerEntry[];
  votes: Record<string, string>;
  polls: Poll[];
  comments: PollComment[];
}

interface PendingVote {
  pollId: string;
  optionId: string;
}

interface Flash {
  id: number;
  delta: number;
}

type Status = "loading" | "ready" | "error";

interface VotelyContextValue {
  status: Status;
  retryLoad: () => void;
  me: string;
  vt: number;
  ledger: LedgerEntry[];
  polls: PollView[];
  pollsById: Map<string, PollView>;
  comments: PollComment[];
  knownUsers: string[];
  rankVersion: number;
  flash: Flash | null;
  pendingVote: PendingVote | null;
  earnPrompt: string | null;
  adOpen: boolean;
  requestVote: (pollId: string, optionId: string) => void;
  confirmVote: () => void;
  cancelVote: () => void;
  createPoll: (input: NewPollInput) => ActionResult;
  boostPoll: (pollId: string, amount: number) => ActionResult;
  extendPoll: (pollId: string, days: number) => ActionResult;
  addComment: (pollId: string, text: string, parentId: string | null) => ActionResult;
  openAd: () => void;
  closeAd: () => void;
  completeAd: () => void;
  promptEarn: (reason: string) => void;
  dismissEarnPrompt: () => void;
  refresh: () => Promise<void>;
}

const VotelyContext = createContext<VotelyContextValue | undefined>(undefined);

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function emptyData(): Data {
  return {
    vt: 0,
    ledger: [],
    votes: {},
    polls: [],
    comments: [],
  };
}

function parseData(slices: Record<Slice, Record<string, unknown> | null>): {
  data: Data;
  isNewUser: boolean;
} {
  const wallet = slices.wallet;
  const hasWallet = isRecord(wallet) && typeof wallet.vt === "number";
  const base = emptyData();

  const data: Data = {
    vt: hasWallet ? Math.max(0, Math.floor(wallet.vt as number)) : base.vt,
    ledger:
      hasWallet && Array.isArray(wallet.ledger)
        ? (wallet.ledger as LedgerEntry[]).slice(0, LIMITS.maxLedger)
        : base.ledger,
    votes: isRecord(slices.votes) && isRecord(slices.votes.map)
      ? (slices.votes.map as Record<string, string>)
      : {},
    polls: isRecord(slices.polls) && Array.isArray(slices.polls.list)
      ? (slices.polls.list as Poll[]).map((poll) => ({ ...poll, endsAt: Number.isFinite(poll.endsAt) ? poll.endsAt : (poll.createdAt ?? Date.now()) + 7 * 24 * 60 * 60 * 1000 }))
      : [],
    comments: isRecord(slices.comments) && Array.isArray(slices.comments.list)
      ? (slices.comments.list as PollComment[])
      : [],
  };
  return { data, isNewUser: !hasWallet };
}

function serialize(slice: Slice, data: Data): Record<string, unknown> {
  switch (slice) {
    case "wallet":
      return { vt: data.vt, ledger: data.ledger };
    case "votes":
      return { map: data.votes };
    case "polls":
      return { list: data.polls };
    case "comments":
      return { list: data.comments };
  }
}

function withLedger(data: Data, kind: "earn" | "spend", amount: number, label: string) {
  const entry: LedgerEntry = { id: newId("tx"), kind, amount, label, at: Date.now() };
  return {
    vt: kind === "earn" ? data.vt + amount : data.vt - amount,
    ledger: [entry, ...data.ledger].slice(0, LIMITS.maxLedger),
  };
}

export function VotelyProvider({ children }: { children: ReactNode }) {
  const { user, login } = usePiAuth();
  const me = user?.username ?? "you";
  const persistent = Boolean(user);

  const [status, setStatus] = useState<Status>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [data, setData] = useState<Data>(emptyData);
  const [live, setLive] = useState<Record<string, Record<string, number>>>({});
  const [rankVersion, setRankVersion] = useState(0);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [pendingVote, setPendingVote] = useState<PendingVote | null>(null);
  const [earnPrompt, setEarnPrompt] = useState<string | null>(null);
  const [adOpen, setAdOpen] = useState(false);

  const dataRef = useRef<Data>(data);
  const saverRef = useRef<ReturnType<typeof createSaver> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    if (!persistent) {
      const initial = emptyData();
      dataRef.current = initial;
      setData(initial);
      setStatus("ready");
      return;
    }

    loadSlices(user!.uid)
      .then((slices) => {
        if (cancelled) return;
        const { data: loaded, isNewUser } = parseData(slices);
        if (isNewUser) { const welcome = withLedger({ ...loaded, vt: 0 }, "earn", WELCOME_VT, "Welcome gift for joining Votely"); Object.assign(loaded, welcome); }
        dataRef.current = loaded;
        setData(loaded);
        saverRef.current = createSaver({
          uid: user!.uid,
          read: (slice) => serialize(slice, dataRef.current),
          onFailure: () =>
            toast.error("Couldn't save your latest changes", {
              description: "We'll keep trying in the background.",
            }),
          onRecovered: () => toast.success("Your changes are saved"),
        });
        if (isNewUser) saverRef.current.mark("wallet");
        setStatus("ready");
      })
      .catch((error) => {
        console.error("[Votely] Loading failed:", error);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      saverRef.current?.dispose();
      saverRef.current = null;
    };
  }, [persistent, user?.uid, loadAttempt]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") saverRef.current?.flushNow();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  const commit = useCallback((next: Data, slices: Slice[]) => {
    dataRef.current = next;
    setData(next);
    slices.forEach((slice) => saverRef.current?.mark(slice));
  }, []);

  const announce = useCallback((delta: number, description: string) => {
    setFlash({ id: Date.now(), delta });
    if (delta > 0) {
      toast.success(`+${delta} VT earned`, { description });
    } else {
      toast(`${delta} VT spent`, { description });
    }
  }, []);

  const bumpLive = useCallback((count: number) => {
    setLive((previous) => {
      const next = { ...previous };
      for (let i = 0; i < count; i++) {
        const poll = SEED_POLLS[Math.floor(Math.random() * SEED_POLLS.length)];
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
        let roll = Math.random() * totalVotes;
        const option = poll.options.find((o) => (roll -= o.votes) <= 0) ?? poll.options[0];
        const current = next[poll.id] ?? {};
        next[poll.id] = { ...current, [option.id]: (current[option.id] ?? 0) + 1 };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") bumpLive(1);
    }, 8_000);
    return () => clearInterval(timer);
  }, [status, bumpLive]);

  const promptEarn = useCallback((reason: string) => setEarnPrompt(reason), []);
  const dismissEarnPrompt = useCallback(() => setEarnPrompt(null), []);
  const openAd = useCallback(() => {
    setEarnPrompt(null);
    setAdOpen(true);
  }, []);
  const closeAd = useCallback(() => setAdOpen(false), []);

  const completeAd = useCallback(() => {
    setAdOpen(false);
    toast("Reward ads are not connected yet. No VT has been credited.");
  }, []);

  const requestVote = useCallback(
    (pollId: string, optionId: string) => {
      if (!user) {
        toast("Sign in with Pi to vote.");
        void login();
        return;
      }
      const current = dataRef.current;
      if (current.votes[pollId] === optionId) return;
      if (current.vt < VOTE_COST) {
        setEarnPrompt(`Voting costs ${VOTE_COST} VT and your balance is ${current.vt} VT.`);
        return;
      }
      setPendingVote({ pollId, optionId });
    },
    [user, login],
  );

  const cancelVote = useCallback(() => setPendingVote(null), []);

  const confirmVote = useCallback(() => {
    if (!pendingVote) return;
    const current = dataRef.current;
    setPendingVote(null);
    if (current.votes[pendingVote.pollId] === pendingVote.optionId) return;
    if (current.vt < VOTE_COST) {
      setEarnPrompt(`Voting costs ${VOTE_COST} VT and your balance is ${current.vt} VT.`);
      return;
    }
    commit(
      {
        ...current,
        votes: { ...current.votes, [pendingVote.pollId]: pendingVote.optionId },
      },
      ["votes"],
    );
    toast.success(current.votes[pendingVote.pollId] ? "Your vote has been changed." : "Your vote is in. Results are live.");
  }, [pendingVote, commit, announce]);

  const createPoll = useCallback(
    (input: NewPollInput): ActionResult => {
      if (!user) {
        toast("Sign in with Pi to create a poll.");
        void login();
        return { ok: false, reason: "Please sign in with Pi first." };
      }
      const current = dataRef.current;
      const question = input.question.trim();
      const seen = new Set<string>();
      const options = input.options
        .map((text) => text.trim())
        .filter((text) => {
          const key = text.toLowerCase();
          if (!text || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      const boost = Math.min(Math.max(0, Math.floor(input.boost)), LIMITS.maxBoost);

      if (question.length < 5) return { ok: false, reason: "Add a question of at least 5 characters." };
      if (options.length < LIMITS.minOptions) {
        return { ok: false, reason: "Add at least two different answer options." };
      }
      if (!Number.isFinite(input.endsAt) || input.endsAt <= Date.now()) return { ok: false, reason: "Choose a closing date and time in the future." };

      const cost = POST_COST + boost;
      if (current.vt < cost) {
        setEarnPrompt(`Posting this poll costs ${cost} VT and your balance is ${current.vt} VT.`);
        return { ok: false, reason: "Not enough VT." };
      }

      const id = newId("poll");
      const poll: Poll = {
        id,
        question,
        category: input.category && CATEGORIES.includes(input.category) ? input.category : null,
        authorName: me,
        createdAt: Date.now(),
        endsAt: input.endsAt,
        boost,
        coverImage: input.coverImage ?? null,
        galleryImages: (input.galleryImages ?? []).slice(0, 4),
        options: options
          .slice(0, LIMITS.maxOptions)
          .map((text, i) => ({ id: `${id}-o${i + 1}`, text, votes: 0 })),
      };

      let polls = [poll, ...current.polls];
      let comments = current.comments;
      if (polls.length > LIMITS.maxOwnPolls) {
        const dropped = new Set(polls.slice(LIMITS.maxOwnPolls).map((p) => p.id));
        polls = polls.slice(0, LIMITS.maxOwnPolls);
        comments = comments.filter((c) => !dropped.has(c.pollId));
      }

      const ledger = withLedger(
        current,
        "spend",
        cost,
        boost > 0 ? `Posted a poll with a ${boost} VT boost` : "Posted a poll",
      );
      commit({ ...current, ...ledger, polls, comments }, ["wallet", "polls", "comments"]);
      setRankVersion((v) => v + 1);
      announce(-cost, boost > 0 ? "Your poll is live and boosted." : "Your poll is live.");
      return { ok: true, id };
    },
    [me, user, login, commit, announce],
  );

  const boostPoll = useCallback(
    (pollId: string, amount: number): ActionResult => {
      if (!user) {
        toast("Sign in with Pi to promote a poll.");
        void login();
        return { ok: false, reason: "Please sign in with Pi first." };
      }
      const current = dataRef.current;
      const poll = current.polls.find((p) => p.id === pollId);
      if (!poll) return { ok: false, reason: "Only your own polls can be boosted." };
      if (poll.boost + amount > LIMITS.maxBoost) {
        return { ok: false, reason: `Boosts are capped at ${LIMITS.maxBoost} VT per poll.` };
      }
      if (current.vt < amount) {
        setEarnPrompt(`Boosting costs ${amount} VT and your balance is ${current.vt} VT.`);
        return { ok: false, reason: "Not enough VT." };
      }
      const ledger = withLedger(current, "spend", amount, "Boosted a poll");
      commit(
        {
          ...current,
          ...ledger,
          polls: current.polls.map((p) => (p.id === pollId ? { ...p, boost: p.boost + amount } : p)),
        },
        ["wallet", "polls"],
      );
      setRankVersion((v) => v + 1);
      announce(-amount, "Your poll will show up higher in the feed.");
      return { ok: true };
    },
    [user, login, commit, announce],
  );

  const extendPoll = useCallback(
    (pollId: string, days: number): ActionResult => {
      if (!user) { toast("Sign in with Pi to extend a poll."); void login(); return { ok: false, reason: "Please sign in with Pi first." }; }
      const current = dataRef.current;
      const poll = current.polls.find((item) => item.id === pollId);
      const count = Math.floor(days);
      if (!poll || poll.authorName !== me) return { ok: false, reason: "Only the poll creator can extend this poll." };
      if (!Number.isFinite(count) || count < 1 || count > 30) return { ok: false, reason: "Choose between 1 and 30 extra days." };
      const cost = count;
      if (current.vt < cost) { setEarnPrompt(`Extending this poll costs ${cost} VT and your balance is ${current.vt} VT.`); return { ok: false, reason: "Not enough VT." }; }
      const base = Math.max(Date.now(), poll.endsAt);
      const ledger = withLedger(current, "spend", cost, `Extended poll by ${count} day${count === 1 ? "" : "s"}`);
      commit({ ...current, ...ledger, polls: current.polls.map((item) => item.id === pollId ? { ...item, endsAt: base + count * 24 * 60 * 60 * 1000 } : item) }, ["wallet", "polls"]);
      toast.success(`Poll extended by ${count} day${count === 1 ? "" : "s"}.`);
      return { ok: true };
    },
    [user, login, me, commit],
  );

  const addComment = useCallback(
    (pollId: string, text: string, parentId: string | null): ActionResult => {
      if (!user) {
        toast("Sign in with Pi to comment.");
        void login();
        return { ok: false, reason: "Please sign in with Pi first." };
      }
      const current = dataRef.current;
      const body = text.trim().slice(0, LIMITS.comment);
      if (!body) return { ok: false, reason: "Write something first." };

      let topLevelParent = parentId;
      if (parentId) {
        const parent =
          current.comments.find((c) => c.id === parentId) ??
          SEED_COMMENTS.find((c) => c.id === parentId);
        topLevelParent = parent?.parentId ?? parentId;
      }

      const entry: PollComment = {
        id: newId("c"),
        pollId,
        parentId: topLevelParent,
        authorName: me,
        text: body,
        createdAt: Date.now(),
      };
      commit(
        { ...current, comments: [...current.comments, entry].slice(-LIMITS.maxOwnComments) },
        ["comments"],
      );
      return { ok: true, id: entry.id };
    },
    [me, user, login, commit],
  );

  const refresh = useCallback(async () => {
    bumpLive(4);
    setRankVersion((v) => v + 1);
    await new Promise((resolve) => setTimeout(resolve, 700));
  }, [bumpLive]);

  const allComments = useMemo(() => [...SEED_COMMENTS, ...data.comments], [data.comments]);

  const polls = useMemo<PollView[]>(() => {
    const commentCounts = new Map<string, number>();
    allComments.forEach((c) => commentCounts.set(c.pollId, (commentCounts.get(c.pollId) ?? 0) + 1));
    const now = Date.now();

    return [...data.polls, ...SEED_POLLS].map((poll) => {
      const myVote = data.votes[poll.id] ?? null;
      const counted = poll.options.map((option) => ({
        ...option,
        votes: option.votes + (live[poll.id]?.[option.id] ?? 0) + (myVote === option.id ? 1 : 0),
      }));
      const total = counted.reduce((sum, option) => sum + option.votes, 0);
      const commentCount = commentCounts.get(poll.id) ?? 0;
      const ageHours = (now - poll.createdAt) / 3_600_000;
      return {
        ...poll,
        isClosed: poll.endsAt <= now,
        daysRemaining: Math.max(0, Math.ceil((poll.endsAt - now) / (24 * 60 * 60 * 1000))),
        options: counted.map((option) => ({
          ...option,
          percent: total > 0 ? Math.round((option.votes / total) * 100) : 0,
        })),
        total,
        myVote,
        commentCount,
        score: total + commentCount * 4 + poll.boost * 40 + Math.max(0, 72 - ageHours) * 3 + Math.max(0, 12 - ageHours) * 150,
      };
    });
  }, [data.polls, data.votes, live, allComments]);

  const pollsById = useMemo(() => new Map(polls.map((p) => [p.id, p])), [polls]);

  const knownUsers = useMemo(
    () => (SEED_USERS.includes(me) ? SEED_USERS : [me, ...SEED_USERS]),
    [me],
  );

  const value = useMemo<VotelyContextValue>(
    () => ({
      status,
      retryLoad: () => setLoadAttempt((n) => n + 1),
      me,
      vt: data.vt,
      ledger: data.ledger,
      polls,
      pollsById,
      comments: allComments,
      knownUsers,
      rankVersion,
      flash,
      pendingVote,
      earnPrompt,
      adOpen,
      requestVote,
      confirmVote,
      cancelVote,
      createPoll,
      boostPoll,
      extendPoll,
      addComment,
      openAd,
      closeAd,
      completeAd,
      promptEarn,
      dismissEarnPrompt,
      refresh,
    }),
    [
      status,
      me,
      data.vt,
      data.ledger,
      polls,
      pollsById,
      allComments,
      knownUsers,
      rankVersion,
      flash,
      pendingVote,
      earnPrompt,
      adOpen,
      requestVote,
      confirmVote,
      cancelVote,
      createPoll,
      boostPoll,
      extendPoll,
      addComment,
      openAd,
      closeAd,
      completeAd,
      promptEarn,
      dismissEarnPrompt,
      refresh,
    ],
  );

  return <VotelyContext.Provider value={value}>{children}</VotelyContext.Provider>;
}

export function useVotely() {
  const context = useContext(VotelyContext);
  if (!context) throw new Error("useVotely must be used within VotelyProvider");
  return context;
}
