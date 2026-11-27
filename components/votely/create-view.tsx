"use client";

import { useState } from "react";
import { Coins, Minus, Plus, Rocket, Tv, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNav } from "@/lib/votely/nav";
import { POST_COST, useVotely } from "@/lib/votely/store";
import { CATEGORIES, LIMITS, type Category } from "@/lib/votely/types";

export function CreateView() {
  const { vt, createPoll, openAd } = useVotely();
  const { setTab, openPoll } = useNav();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [category, setCategory] = useState<Category | null>(null);
  const [boost, setBoost] = useState(0);

  const cost = POST_COST + boost;
  const canAfford = vt >= cost;
  const filledOptions = options.filter((o) => o.trim()).length;
  const isValid = question.trim().length >= 5 && filledOptions >= LIMITS.minOptions;

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((o, i) => (i === index ? value : o)));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = createPoll({ question, options, category, boost });
    if (!result.ok) {
      if (result.reason !== "Not enough VT.") toast.error(result.reason);
      return;
    }
    setQuestion("");
    setOptions(["", ""]);
    setCategory(null);
    setBoost(0);
    setTab("home");
    if (result.id) openPoll(result.id);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Create a poll</h1>
        <p className="text-sm text-muted-foreground">Ask the community and see what they think.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="question" className="text-sm font-semibold">
          Your question
        </label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={LIMITS.question}
          rows={3}
          placeholder="What do you want to ask?"
          className="resize-none bg-card text-base"
        />
        <span className="self-end text-xs text-muted-foreground tabular-nums">
          {question.length}/{LIMITS.question}
        </span>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-semibold">Answer options</legend>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              maxLength={LIMITS.option}
              placeholder={`Option ${index + 1}`}
              aria-label={`Option ${index + 1}`}
              className="bg-card"
            />
            {options.length > LIMITS.minOptions && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove option ${index + 1}`}
                onClick={() => setOptions((current) => current.filter((_, i) => i !== index))}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
        {options.length < LIMITS.maxOptions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setOptions((current) => [...current, ""])}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add option
          </Button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-semibold">Category (optional)</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(category === item ? null : item)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <section aria-labelledby="boost-heading" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Rocket className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id="boost-heading" className="text-sm font-semibold">
              Boost visibility (optional)
            </h2>
            <p className="text-sm text-muted-foreground">
              Spend extra VT to show your poll higher in the feed.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Extra boost</span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Decrease boost"
              disabled={boost === 0}
              onClick={() => setBoost((b) => Math.max(0, b - 1))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-14 text-center font-semibold tabular-nums" aria-live="polite">
              {boost} VT
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Increase boost"
              disabled={boost >= LIMITS.maxBoost}
              onClick={() => setBoost((b) => Math.min(LIMITS.maxBoost, b + 1))}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl bg-secondary p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Coins className="size-4" aria-hidden="true" />
            Posting cost
          </span>
          <span className="font-semibold tabular-nums">{cost} VT</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Your balance</span>
          <span className="tabular-nums">{vt} VT</span>
        </div>
        {!canAfford && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 text-sm">
            <span>You need {cost - vt} more VT to post this.</span>
            <Button type="button" size="sm" onClick={openAd} className="shrink-0">
              <Tv className="size-4" aria-hidden="true" />
              Watch ad
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" disabled={!isValid || !canAfford}>
        Post poll for {cost} VT
      </Button>
    </form>
  );
}
