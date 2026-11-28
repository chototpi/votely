"use client";

import { useRef } from "react";
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
import { AD_REWARD, useVotely } from "@/lib/votely/store";

export function VoteConfirmDrawer() {
  const { pendingVote, pollsById, confirmVote, cancelVote } = useVotely();
  const lastPending = useRef(pendingVote);
  if (pendingVote) lastPending.current = pendingVote;

  const shown = pendingVote ?? lastPending.current;
  const poll = shown ? pollsById.get(shown.pollId) : undefined;
  const option = poll?.options.find((o) => o.id === shown?.optionId);
  const isChangingVote = Boolean(poll?.myVote);

  return (
    <Drawer open={pendingVote !== null} onOpenChange={(open) => !open && cancelVote()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl">
          <DrawerHeader>
            <DrawerTitle>{isChangingVote ? "Change your vote" : "Confirm your vote"}</DrawerTitle>
            <DrawerDescription>{poll?.question}</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3 px-4">
            <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/10 p-3">
              <Check className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">{option?.text}</span>
            </div>
            <p className="text-xs text-muted-foreground">{isChangingVote ? "Your previous choice will be replaced with this one." : "Voting is free. You can change your choice later while the poll is open."}</p>
          </div>
          <DrawerFooter>
            <Button size="lg" onClick={confirmVote}>
              {isChangingVote ? "Update vote" : "Submit vote"}
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

export function AdDialog() {
  const { adOpen, closeAd } = useVotely();

  return (
    <Dialog open={adOpen} onOpenChange={(open) => !open && closeAd()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pi rewarded ads</DialogTitle>
          <DialogDescription>
            Rewarded ads will open through the official Pi SDK. VT is credited only after the server verifies the ad with Pi.
          </DialogDescription>
        </DialogHeader>
        <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl bg-secondary px-5 text-center">
          <Tv className="size-9 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-secondary-foreground">Pi Ads connection is being prepared</span>
          <span className="text-xs text-muted-foreground">No simulated ad or automatic VT reward is used.</span>
        </div>
        <Button size="lg" variant="outline" onClick={closeAd}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}
