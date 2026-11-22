"use client";

import Link from "next/link";
import { Compass, FileSignature, House, Plus, Settings, UserRound, Vote } from "lucide-react";
import { Brand } from "@/components/brand";

const items = [
  { label: "Home", href: "/", icon: House, active: true },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Polls", href: "/polls", icon: Vote },
  { label: "Petitions", href: "/petitions", icon: FileSignature },
  { label: "Profile", href: "/profile", icon: UserRound }
];

export function Sidebar({ activePath = "/" }: { activePath?: string }) {
  return (
    <aside className="hidden w-[245px] shrink-0 lg:block">
      <div className="sticky top-6 rounded-[28px] border border-white bg-white p-5 shadow-soft">
        <Brand />
        <div className="mt-9 space-y-2">
          {items.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${href === activePath ? "bg-votely-lavender text-votely-purple" : "text-slate-500 hover:bg-slate-50 hover:text-votely-ink"}`}>
              <Icon size={19} /> {label}
            </Link>
          ))}
        </div>
        <Link href="/create" className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-votely-purple px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-votely-deep">
          <Plus size={18} /> Create a poll
        </Link>
        <div className="mt-8 rounded-2xl bg-[#F8F6FE] p-4">
          <div className="text-sm font-bold text-votely-ink">Your voice matters</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Join conversations and help communities make better decisions.</p>
        </div>
        <button className="mt-5 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50">
          <Settings size={18} /> Settings
        </button>
      </div>
    </aside>
  );
}
