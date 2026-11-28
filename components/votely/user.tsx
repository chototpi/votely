"use client";

import { cn } from "@/lib/utils";
import { useNav } from "@/lib/votely/nav";

function hueFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return hash;
}

const SIZES = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-20 text-3xl",
} as const;

export function UserAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const hue = hueFor(name);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-heading font-bold uppercase",
        SIZES[size],
        className,
      )}
      style={{
        backgroundColor: `oklch(0.9 0.07 ${hue})`,
        color: `oklch(0.35 0.1 ${hue})`,
      }}
    >
      {name.charAt(0)}
    </span>
  );
}

export function UserLink({
  name,
  showAvatar = true,
  className,
}: {
  name: string;
  showAvatar?: boolean;
  className?: string;
}) {
  const { openUser } = useNav();
  return (
    <button
      type="button"
      onClick={() => openUser(name)}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-full text-left text-sm font-medium hover:text-primary focus-visible:outline-2",
        className,
      )}
    >
      {showAvatar && <UserAvatar name={name} size="sm" />}
      <span className="truncate">{name}</span>
    </button>
  );
}
