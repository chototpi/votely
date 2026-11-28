"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Coins, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { AD_REWARD, useVotely, VOTE_COST } from "@/lib/votely/store";

export function VoteConfirmDrawer() {
  const { pendingVote, pollsById, vt, confirmVote, cancelVote } = useVotely();
  const lastPending = useRef(pendingVote);
  if (pendingVote) lastPending.current = pendingVote;

  const shown = pendingVote ?? lastPending.current;
  const poll = shown ? pollsById.get(shown.pollId) : undefined;
  const option = poll?.options.find((o) => o.id === shown?.optionId);

  return (
    <Drawer open={pendingVote !== null} onOpenChange={(open) => !open && cancelVote()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl">
          <DrawerHeader>
            <DrawerTitle>Confirm your vote</DrawerTitle>
            <DrawerDescription>{poll?.question}</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3 px-4">
            <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/10 p-3">
              <Check className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">{option?.text}</span>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl bg-secondary p-3 text-sm">
              <div className="flex justify-between">
                <span>Cost</span>
                <span className="font-semibold tabular-nums">{VOTE_COST} VT</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Balance after voting</span>
                <span className="tabular-nums">
                  {vt} VT to {Math.max(0, vt - VOTE_COST)} VT
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Each poll allows one vote and it can&apos;t be changed.</p>
          </div>
          <DrawerFooter>
            <Button size="lg" onClick={confirmVote}>
              Vote for {VOTE_COST} VT
            </Button>
            <Button variant="ghost" onClick={cancelVote}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function EarnPromptDrawer() {
  const { earnPrompt, dismissEarnPrompt, openAd } = useVotely();
  const lastPrompt = useRef(earnPrompt);
  if (earnPrompt) lastPrompt.current = earnPrompt;

  return (
    <Drawer open={earnPrompt !== null} onOpenChange={(open) => !open && dismissEarnPrompt()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl">
          <DrawerHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Coins className="size-6" aria-hidden="true" />
            </div>
            <DrawerTitle>You need more VT</DrawerTitle>
            <DrawerDescription>{lastPrompt.current}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button size="lg" onClick={openAd}>
              <Tv className="size-5" aria-hidden="true" />
              Watch ad, earn {AD_REWARD} VT
            </Button>
            <Button variant="ghost" onClick={dismissEarnPrompt}>
              Not now
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const AD_SECONDS = 5;

export function AdDialog() {
  const { adOpen, closeAd, completeAd } = useVotely();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!adOpen) return;
    setElapsed(0);
    const timer = setInterval(() => {
      setElapsed((value) => Math.min(value + 1, AD_SECONDS));
    }, 1000);
    return () => clearInterval(timer);
  }, [adOpen]);

  const done = elapsed >= AD_SECONDS;

  return (
    <Dialog open={adOpen} onOpenChange={(open) => !open && closeAd()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sponsored message</DialogTitle>
          <DialogDescription>
            This is a simulated ad. Watch it to the end to earn {AD_REWARD} VT.
          </DialogDescription>
        </DialogHeader>
        <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl bg-secondary text-center">
          <Tv className="size-8 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium text-secondary-foreground">
            {done ? "Thanks for watching" : "Your ad is playing"}
          </span>
        </div>
        <Progress value={(elapsed / AD_SECONDS) * 100} aria-label="Ad progress" />
        <Button size="lg" disabled={!done} onClick={completeAd}>
          {done ? `Collect ${AD_REWARD} VT` : `Reward in ${AD_SECONDS - elapsed}s`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
