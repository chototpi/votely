import { formatDistanceToNowStrict } from "date-fns";

export function timeAgo(timestamp: number): string {
  return formatDistanceToNowStrict(timestamp, { addSuffix: true });
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`;
}
