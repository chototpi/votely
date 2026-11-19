import Link from "next/link";
import { Bell, ChevronRight, Flame, Globe2, Search, Sparkles, TrendingUp, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { Sidebar } from "@/components/sidebar";
import { PollCard } from "@/components/poll-card";

const polls = [
  {
    category: "Environment",
    time: "Closes in 12 days",
    title: "What should our cities prioritize for a greener future?",
    description: "A community conversation about the changes that can make urban life healthier and more sustainable.",
    options: [
      { label: "More parks and green spaces", percent: 52 },
      { label: "Cleaner public transportation", percent: 31, color: "bg-sky-400" },
      { label: "Renewable energy", percent: 17, color: "bg-emerald-400" }
    ],
    votes: "12.6K",
    comments: 248,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85",
    tag: "Trending"
  },
  {
    category: "Technology",
    time: "Closes in 5 days",
    title: "Which technology will have the biggest impact on everyday life?",
    description: "Share your perspective on the innovations shaping the next decade.",
    options: [
      { label: "Artificial intelligence", percent: 48 },
      { label: "Clean energy technology", percent: 32, color: "bg-sky-400" },
      { label: "Healthcare innovation", percent: 20, color: "bg-emerald-400" }
    ],
    votes: "8.2K",
    comments: 164,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=85"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen pb-24">
      <header className="border-b border-white bg-white/90 backdrop-blur">
        <div className="container-shell flex h-[76px] items-center justify-between">
          <div className="lg:hidden"><Brand /></div>
          <div className="hidden text-sm font-semibold text-slate-400 lg:block">Thursday, November 19, 2026</div>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-500 hover:bg-votely-lavender hover:text-votely-purple"><Bell size={19}/></button>
            <button className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 py-1.5 pl-1.5 pr-3 text-sm font-bold text-votely-purple">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-200 text-xs">G</span>
              Connect Pi
            </button>
          </div>
        </div>
      </header>

      <div className="container-shell grid grid-cols-1 gap-7 pt-7 lg:grid-cols-[245px_minmax(0,1fr)]">
        <Sidebar />
        <section className="min-w-0">
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#6541C5] via-[#7956D8] to-[#A78BFA] px-6 py-8 text-white shadow-soft sm:px-9 sm:py-10">
            <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[1px] border-white/20" />
            <div className="absolute -right-2 -top-12 h-56 w-56 rounded-full border-[1px] border-white/20" />
            <div className="relative max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90"><Sparkles size={14}/> A world of shared voices</div>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Your voice can<br className="hidden sm:block"/> shape tomorrow.</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-base">Ask questions, share your point of view, and help communities make decisions together.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/explore" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-votely-purple transition hover:bg-violet-50">Explore polls <ChevronRight className="ml-1 inline" size={16}/></Link>
                <Link href="/create" className="rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20">Create a poll</Link>
              </div>
            </div>
            <div className="absolute bottom-5 right-8 hidden items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:flex">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20"><Globe2 size={23}/></div>
              <div><div className="text-xl font-extrabold">Global</div><div className="text-[11px] text-white/75">Voices without borders</div></div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            {[
              { label: "Active polls", value: "—", icon: TrendingUp },
              { label: "Community voices", value: "—", icon: Users },
              { label: "Countries", value: "—", icon: Globe2 }
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 sm:text-xs">{label}</span>
                  <Icon size={17} className="text-votely-purple"/>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-votely-ink">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-votely-purple"><Flame size={15}/> Community picks</div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-votely-ink">Trending conversations</h2>
              <p className="mt-1 text-sm text-slate-500">Discover what people around the world are talking about.</p>
            </div>
            <Link href="/explore" className="text-sm font-bold text-votely-purple hover:text-votely-deep">See all <ChevronRight className="inline" size={16}/></Link>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {polls.map((poll) => <PollCard key={poll.title} {...poll}/>)}
          </div>

          <div className="mt-8 rounded-[26px] border border-violet-100 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-lg font-extrabold text-votely-ink">Have a question worth asking?</div>
                <p className="mt-1 text-sm text-slate-500">Start a conversation and invite the world to take part.</p>
              </div>
              <Link href="/create" className="inline-flex items-center justify-center rounded-full bg-votely-purple px-5 py-3 text-sm font-bold text-white hover:bg-votely-deep">Create your first poll</Link>
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {[
            { label: "Home", href: "/", icon: "⌂", active: true },
            { label: "Explore", href: "/explore", icon: "⌕" },
            { label: "Create", href: "/create", icon: "+" },
            { label: "Petitions", href: "/petitions", icon: "✎" },
            { label: "Profile", href: "/profile", icon: "○" }
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex min-w-12 flex-col items-center gap-0.5 text-[10px] font-semibold ${item.active ? "text-votely-purple" : "text-slate-400"}`}>
              <span className={`grid h-8 w-8 place-items-center text-xl ${item.label === "Create" ? "rounded-full bg-votely-purple text-white shadow-md shadow-violet-200" : ""}`}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
