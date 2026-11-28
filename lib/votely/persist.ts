import { pi } from "@/lib/pi";

export const STATE_KEYS = {
  wallet: "votely-wallet",
  votes: "votely-votes",
  polls: "votely-polls",
  comments: "votely-comments",
} as const;

export type Slice = keyof typeof STATE_KEYS;

const BASE_DELAY_MS = 6_000;
const MAX_DELAY_MS = 60_000;
const GAP_BETWEEN_WRITES_MS = 2_300;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function loadSlices(): Promise<Record<Slice, Record<string, unknown> | null>> {
  const slices = Object.keys(STATE_KEYS) as Slice[];
  const records = await Promise.all(slices.map((slice) => pi.userState.get(STATE_KEYS[slice])));
  const result = {} as Record<Slice, Record<string, unknown> | null>;
  slices.forEach((slice, i) => {
    result[slice] = records[i]?.blob ?? null;
  });
  return result;
}

interface SaverOptions {
  read: (slice: Slice) => Record<string, unknown>;
  onFailure: () => void;
  onRecovered: () => void;
}

/**
 * Debounced, rate-limit friendly writer. Changes are kept in memory by the caller and written
 * through here; a failed write keeps the slice dirty and retries with growing delays.
 */
export function createSaver({ read, onFailure, onRecovered }: SaverOptions) {
  const dirty = new Set<Slice>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let delay = BASE_DELAY_MS;
  let busy = false;
  let failing = false;

  function schedule(ms: number) {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      void flush();
    }, ms);
  }

  async function flush() {
    if (busy) return;
    busy = true;
    let failed = false;
    const pending = Array.from(dirty);
    for (let i = 0; i < pending.length; i++) {
      const slice = pending[i];
      dirty.delete(slice);
      try {
        await pi.userState.set(STATE_KEYS[slice], read(slice));
        if (i < pending.length - 1) await sleep(GAP_BETWEEN_WRITES_MS);
      } catch (error) {
        console.error("[Votely] Saving failed:", error);
        dirty.add(slice);
        failed = true;
        break;
      }
    }
    busy = false;

    if (failed) {
      if (!failing) onFailure();
      failing = true;
      delay = Math.min(delay * 2, MAX_DELAY_MS);
      schedule(delay);
      return;
    }

    if (failing) onRecovered();
    failing = false;
    delay = BASE_DELAY_MS;
    if (dirty.size > 0) schedule(BASE_DELAY_MS);
  }

  return {
    mark(slice: Slice) {
      dirty.add(slice);
      schedule(delay);
    },
    flushNow() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (dirty.size > 0) void flush();
    },
    dispose() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    },
  };
}
