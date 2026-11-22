"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Bell, History, Wallet } from "lucide-react";
import { Brand } from "@/components/brand";
import { PiAuthButton } from "@/components/pi-auth-button";
import { Sidebar } from "@/components/sidebar";

type PiUser = { uid: string; username: string };
type LedgerEntry = { id: number; amount: number; balanceAfter: number; transactionType: string; description: string | null; createdAt: string };

const transactionLabels: Record<string, string> = {
  ad_reward: "Ad reward", poll_creation: "Poll creation", poll_promotion: "Poll promotion", admin_adjustment: "Account adjustment", refund: "Refund"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ProfilePage() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        const sessionData = await sessionResponse.json();
        if (!sessionData.authenticated) return;
        setUser(sessionData.user);

        const [balanceResponse, historyResponse] = await Promise.all([
          fetch("/api/vt/balance", { cache: "no-store" }),
          fetch("/api/vt/history?limit=20", { cache: "no-store" })
        ]);
        const [balanceData, historyData] = await Promise.all([balanceResponse.json(), historyResponse.json()]);
        if (!balanceResponse.ok || !balanceData.success) throw new Error(balanceData.error || "Không thể tải số dư VT");
        if (!historyResponse.ok || !historyData.success) throw new Error(historyData.error || "Không thể tải lịch sử VT");
        setBalance(Number(balanceData.balance));
        setEntries(historyData.entries);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Không thể tải hồ sơ");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <main className="min-h-screen pb-24">
      <header className="border-b border-white bg-white/90 backdrop-blur"><div className="container-shell flex h-[76px] items-center justify-between"><div className="lg:hidden"><Brand /></div><div className="hidden text-sm font-semibold text-slate-400 lg:block">Your Votely account</div><div className="ml-auto flex items-center gap-3"><button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-500 hover:bg-votely-lavender hover:text-votely-purple"><Bell size={19}/></button><PiAuthButton /></div></div></header>
      <div className="container-shell grid grid-cols-1 gap-7 pt-7 lg:grid-cols-[245px_minmax(0,1fr)]">
        <Sidebar activePath="/profile" />
        <section className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-votely-purple">Account</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-votely-ink">Your profile</h1><p className="mt-2 text-sm text-slate-500">View your Pi account and Votely Token activity.</p>
          {loading ? <div className="mt-7 rounded-[26px] border border-white bg-white p-6 text-sm text-slate-500 shadow-soft">Loading your account…</div> : !user ? <div className="mt-7 rounded-[26px] border border-violet-100 bg-white p-6 shadow-soft sm:p-8"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-votely-lavender text-votely-purple"><Wallet size={23}/></div><h2 className="mt-5 text-xl font-extrabold text-votely-ink">Connect Pi to view your account</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Your Votely Token balance and transaction history are available after a secure Pi Sign-In.</p><div className="mt-5"><PiAuthButton /></div></div> : error ? <div className="mt-7 rounded-[26px] border border-red-100 bg-white p-6 text-sm text-red-600 shadow-soft">{error}</div> : <div className="mt-7 space-y-6">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]"><div className="rounded-[26px] bg-gradient-to-br from-[#6541C5] via-[#7956D8] to-[#A78BFA] p-6 text-white shadow-soft sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-white/75">Votely Token balance</p><div className="mt-3 text-5xl font-extrabold tracking-tight">{balance ?? 0}<span className="ml-2 text-xl text-white/80">VT</span></div></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Wallet size={24}/></div></div><p className="mt-7 text-sm leading-6 text-white/80">VT is a Votely credit for creating and promoting polls. It cannot be transferred, withdrawn, or exchanged.</p></div><div className="rounded-[26px] border border-white bg-white p-6 shadow-soft"><p className="text-xs font-bold uppercase tracking-[0.16em] text-votely-purple">Pi account</p><p className="mt-4 text-xl font-extrabold text-votely-ink">@{user.username}</p><p className="mt-2 break-all text-xs text-slate-400">Pi UID: {user.uid}</p></div></div>
            <section className="rounded-[26px] border border-white bg-white p-5 shadow-soft sm:p-6"><div className="flex items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-votely-purple"><History size={15}/> Transaction history</div><h2 className="mt-2 text-xl font-extrabold text-votely-ink">Your VT activity</h2></div><span className="rounded-full bg-votely-lavender px-3 py-1.5 text-xs font-bold text-votely-purple">{entries.length} entries</span></div>{entries.length === 0 ? <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">No VT transactions yet. Your account starts with 0 VT.</div> : <div className="mt-5 divide-y divide-slate-100">{entries.map((entry) => { const isCredit = Number(entry.amount) > 0; return <div key={entry.id} className="flex items-center gap-3 py-4"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-votely-purple"}`}>{isCredit ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-votely-ink">{entry.description || transactionLabels[entry.transactionType] || entry.transactionType}</p><p className="mt-1 text-xs text-slate-400">{formatDate(entry.createdAt)} · Balance: {entry.balanceAfter} VT</p></div><p className={`text-sm font-extrabold ${isCredit ? "text-emerald-600" : "text-votely-purple"}`}>{isCredit ? "+" : ""}{entry.amount} VT</p></div>; })}</div>}</section>
          </div>}
        </section>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white/95 px-2 py-2 backdrop-blur lg:hidden"><div className="mx-auto flex max-w-lg items-center justify-around">{[{ label: "Home", href: "/", icon: "⌂" }, { label: "Explore", href: "/explore", icon: "⌕" }, { label: "Create", href: "/create", icon: "+" }, { label: "Petitions", href: "/petitions", icon: "✎" }, { label: "Profile", href: "/profile", icon: "○", active: true }].map((item) => <Link key={item.label} href={item.href} className={`flex min-w-12 flex-col items-center gap-0.5 text-[10px] font-semibold ${item.active ? "text-votely-purple" : "text-slate-400"}`}><span className="grid h-8 w-8 place-items-center text-xl">{item.icon}</span>{item.label}</Link>)}</div></nav>
    </main>
  );
}
