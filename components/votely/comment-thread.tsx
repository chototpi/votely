"use client";

import { useMemo, useState } from "react";
import { CornerDownRight, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar, UserLink } from "@/components/votely/user";
import { pluralize, timeAgo } from "@/lib/votely/format";
import { useVotely } from "@/lib/votely/store";
import { LIMITS, type PollComment } from "@/lib/votely/types";

function CommentItem({
  comment,
  isReply,
  onReply,
}: {
  comment: PollComment;
  isReply?: boolean;
  onReply: (comment: PollComment) => void;
}) {
  return (
    <div className="flex gap-3">
      <UserAvatar name={comment.authorName} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <UserLink name={comment.authorName} showAvatar={false} className="text-foreground" />
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(comment.createdAt).toISOString()}>{timeAgo(comment.createdAt)}</time>
        </div>
        <p className="text-sm leading-relaxed text-pretty break-words">{comment.text}</p>
        {!isReply && (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <CornerDownRight className="size-3" aria-hidden="true" />
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

export function CommentThread({ pollId }: { pollId: string }) {
  const { comments, addComment, me } = useVotely();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<PollComment | null>(null);

  const { topLevel, repliesByParent, total } = useMemo(() => {
    const forPoll = comments.filter((c) => c.pollId === pollId);
    const replies = new Map<string, PollComment[]>();
    forPoll
      .filter((c) => c.parentId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .forEach((c) => replies.set(c.parentId!, [...(replies.get(c.parentId!) ?? []), c]));
    return {
      topLevel: forPoll.filter((c) => !c.parentId).sort((a, b) => b.createdAt - a.createdAt),
      repliesByParent: replies,
      total: forPoll.length,
    };
  }, [comments, pollId]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = addComment(pollId, text, replyTo?.id ?? null);
    if (result.ok) {
      setText("");
      setReplyTo(null);
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
      <h2 id="comments-heading" className="font-heading text-lg font-bold">
        {pluralize(total, "comment")}
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-2 rounded-2xl border bg-card p-3">
        {replyTo && (
          <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-1.5 text-xs">
            <span>
              Replying to <strong>{replyTo.authorName}</strong>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="flex items-start gap-3">
          <UserAvatar name={me} size="sm" className="mt-1" />
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={LIMITS.comment}
            rows={2}
            placeholder={replyTo ? "Write a reply" : "Add to the discussion"}
            aria-label={replyTo ? "Write a reply" : "Write a comment"}
            className="min-h-0 resize-none border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground tabular-nums">
            {text.length}/{LIMITS.comment}
          </span>
          <Button type="submit" size="sm" disabled={!text.trim()}>
            <Send className="size-4" aria-hidden="true" />
            {replyTo ? "Reply" : "Comment"}
          </Button>
        </div>
      </form>

      {topLevel.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {topLevel.map((comment) => (
            <li key={comment.id} className="flex flex-col gap-4">
              <CommentItem comment={comment} onReply={setReplyTo} />
              {(repliesByParent.get(comment.id) ?? []).length > 0 && (
                <ul className="ml-4 flex flex-col gap-4 border-l-2 pl-4">
                  {(repliesByParent.get(comment.id) ?? []).map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} isReply onReply={setReplyTo} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
