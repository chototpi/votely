export const CATEGORIES = [
  "Pi Network",
  "Technology",
  "Lifestyle",
  "Food",
  "Sports",
  "Entertainment",
  "Society",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const LIMITS = {
  question: 140,
  option: 60,
  minOptions: 2,
  maxOptions: 6,
  comment: 280,
  maxBoost: 10,
  maxOwnPolls: 30,
  maxOwnComments: 120,
  maxLedger: 20,
} as const;

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  category: Category | null;
  authorName: string;
  createdAt: number;
  boost: number;
  coverImage?: string | null;
  galleryImages?: string[];
}

export interface PollComment {
  id: string;
  pollId: string;
  parentId: string | null;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface LedgerEntry {
  id: string;
  kind: "earn" | "spend";
  amount: number;
  label: string;
  at: number;
}

export interface OptionView extends PollOption {
  percent: number;
}

export interface PollView extends Omit<Poll, "options"> {
  options: OptionView[];
  total: number;
  myVote: string | null;
  commentCount: number;
  score: number;
}

export interface NewPollInput {
  question: string;
  options: string[];
  category: Category | null;
  boost: number;
  coverImage?: string | null;
  galleryImages?: string[];
}

export type ActionResult = { ok: true; id?: string } | { ok: false; reason: string };
