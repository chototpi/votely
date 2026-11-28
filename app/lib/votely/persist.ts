export const STATE_KEYS = {
  wallet: "votely-wallet",
  votes: "votely-votes",
  polls: "votely-polls",
  comments: "votely-comments",
} as const;

export type Slice = keyof typeof STATE_KEYS;

function storageKey(uid: string, slice: Slice) {
  return `votely:${uid}:${STATE_KEYS[slice]}`;
}

export async function loadSlices(uid: string): Promise<Record<Slice, Record<string, unknown> | null>> {
  const result = {} as Record<Slice, Record<string, unknown> | null>;
  for (const slice of Object.keys(STATE_KEYS) as Slice[]) {
    const raw = window.localStorage.getItem(storageKey(uid, slice));
    if (!raw) {
      result[slice] = null;
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      result[slice] = typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null;
    } catch {
      result[slice] = null;
    }
  }
  return result;
}

interface SaverOptions {
  uid: string;
  read: (slice: Slice) => Record<string, unknown>;
  onFailure: () => void;
  onRecovered: () => void;
}

export function createSaver({ uid, read, onFailure, onRecovered }: SaverOptions) {
  const dirty = new Set<Slice>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    try {
      for (const slice of Array.from(dirty)) {
        window.localStorage.setItem(storageKey(uid, slice), JSON.stringify(read(slice)));
        dirty.delete(slice);
      }
      onRecovered();
    } catch (error) {
      console.error("[Votely] Local save failed:", error);
      onFailure();
    }
  }

  return {
    mark(slice: Slice) {
      dirty.add(slice);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        flush();
      }, 500);
    },
    flushNow() {
      if (timer) clearTimeout(timer);
      timer = null;
      if (dirty.size) flush();
    },
    dispose() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}
