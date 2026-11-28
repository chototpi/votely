"use client";

import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Coins, CreditCard, Info, ShieldCheck, Tv, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/votely/format";
import { AD_REWARD, POST_COST, useVotely, VOTE_COST } from "@/lib/votely/store";

const VT_PACKAGES = [
  { id: "vt-100", amount: 100, price: 1 },
  { id: "vt-500", amount: 500, price: 5, popular: true },
  { id: "vt-1000", amount: 1000, price: 10 },
] as const;

export function WalletView() {
  const { vt, ledger, openAd } = useVotely();

  const startPurchase = (amount: number, price: number) => {
    toast.info("Thanh toán Pi đang được hoàn thiện", {
      description: `Gói ${amount.toLocaleString()} VT (${price} Pi) sẽ được kết nối với Pi Payments ở bước backend.`,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 pb-8">
      <header className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <WalletIcon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">VT Wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your Votely points, rewards and purchases.</p>
        </div>
      </header>

      <section aria-label="VT balance" className="relative overflow-hidden rounded-3xl bg-accent p-6 text-accent-foreground sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full border-[28px] border-white/10" />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground/80">
            <Coins className="size-4" aria-hidden="true" /> Available balance
          </div>
          <div className="flex items-end gap-2">
            <span className="font-heading text-5xl font-extrabold tabular-nums tracking-tight sm:text-6xl">{vt.toLocaleString()}</span>
            <span className="pb-1 text-xl font-bold">VT</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" onClick={openAd} className="w-full sm:w-auto">
              <Tv className="mr-2 size-5" aria-hidden="true" /> Watch ad · Earn {AD_REWARD} VT
            </Button>
            <Button size="lg" variant="secondary" onClick={() => document.getElementById("buy-vt")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="w-full sm:w-auto">
              <CreditCard className="mr-2 size-5" aria-hidden="true" /> Buy VT with Pi
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="earn-heading" className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Tv className="size-5" /></div>
            <div>
              <h2 id="earn-heading" className="font-heading text-base font-bold">Rewarded ads</h2>
              <p className="mt-1 text-sm text-muted-foreground">Earn {AD_REWARD} VT for each verified rewarded ad.</p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary px-3 py-2 text-sm sm:text-right">
            <div className="font-semibold">Daily limit: 5 VT</div>
            <div className="text-xs text-muted-foreground">Usage counter connects to the server next</div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Ad availability and reward eligibility are verified by Pi and Votely's backend. No VT is granted by simply opening or watching a simulated screen.
        </div>
      </section>

      <section id="buy-vt" aria-labelledby="buy-heading" className="flex flex-col gap-3 scroll-mt-6">
        <div>
          <h2 id="buy-heading" className="font-heading text-lg font-bold">Buy VT with Pi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose a package that fits your activity.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {VT_PACKAGES.map((item) => (
            <article key={item.id} className={`relative flex flex-col rounded-2xl border bg-card p-4 ${item.popular ? "border-primary ring-1 ring-primary/20" : ""}`}>
              {item.popular && <span className="mb-2 w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">Popular</span>}
              {!item.popular && <span className="mb-2 h-6" />}
              <div className="font-heading text-2xl font-extrabold tabular-nums">{item.amount.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">VT</span></div>
              <div className="mt-1 text-sm text-muted-foreground">{item.price} Pi</div>
              <Button className="mt-4 w-full" variant={item.popular ? "default" : "outline"} onClick={() => startPurchase(item.amount, item.price)}>
                <CreditCard className="mr-2 size-4" /> Buy package
              </Button>
            </article>
          ))}
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Purchases will be credited only after the Pi payment is verified and completed by the server. VT cannot be transferred or withdrawn.</p>
      </section>

      <section aria-labelledby="how-heading" className="rounded-2xl border bg-card p-4 sm:p-5">
        <h2 id="how-heading" className="font-heading text-lg font-bold">How VT works</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          <li className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Verified rewarded ad</span><span className="font-semibold text-primary">+{AD_REWARD} VT</span></li>
          <li className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Cast or change a vote</span><span className="font-semibold">{VOTE_COST === 0 ? "Free" : `${VOTE_COST} VT`}</span></li>
          <li className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Create a poll</span><span className="font-semibold">{POST_COST} VT</span></li>
          <li className="flex items-center justify-between gap-3"><span className="text-muted-foreground">Boost a poll</span><span className="font-semibold">1 VT each</span></li>
        </ul>
        <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">VT is an in-app utility point used within Votely. It is non-transferable and cannot be withdrawn or redeemed for cash.</p>
      </section>

      <section aria-labelledby="activity-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="activity-heading" className="font-heading text-lg font-bold">Recent activity</h2>
          <span className="text-xs text-muted-foreground">Latest transactions</span>
        </div>
        {ledger.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-4 py-8 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted"><CheckCircle2 className="size-5 text-muted-foreground" /></div>
            <p className="mt-3 text-sm font-medium">No transactions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Your VT rewards, purchases and spending will appear here.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            {ledger.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <span aria-hidden="true" className={entry.kind === "earn" ? "flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary" : "flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground"}>
                  {entry.kind === "earn" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-medium">{entry.label}</span><span className="text-xs text-muted-foreground">{timeAgo(entry.at)}</span></div>
                <span className="text-sm font-semibold tabular-nums">{entry.kind === "earn" ? "+" : "-"}{entry.amount} VT</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
