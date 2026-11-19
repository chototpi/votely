import { MessageCircle, Share2, Users } from "lucide-react";

type PollCardProps = {
  category: string;
  time: string;
  title: string;
  description: string;
  options: { label: string; percent: number; color?: string }[];
  votes: string;
  comments: number;
  image: string;
  tag?: string;
};

export function PollCard(props: PollCardProps) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-soft">
      <div className="relative h-40 overflow-hidden sm:h-48">
        {/* Remote image is decorative demo content; production images will use managed storage. */}
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(90deg, rgba(32,24,70,.68), rgba(32,24,70,.06)), url("${props.image}")`, backgroundPosition: "center", backgroundSize: "cover" }} />
        <div className="absolute left-5 top-5 flex gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-votely-purple">{props.category}</span>
          {props.tag && <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">{props.tag}</span>}
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-xs font-medium text-white/80">{props.time}</p>
          <h2 className="mt-1 max-w-xl text-xl font-extrabold leading-tight text-white sm:text-2xl">{props.title}</h2>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm leading-6 text-slate-500">{props.description}</p>
        <div className="mt-5 space-y-4">
          {props.options.map((option) => (
            <div key={option.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-votely-ink">{option.label}</span>
                <span className="font-bold text-slate-500">{option.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${option.color ?? "bg-votely-purple"}`} style={{ width: `${option.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><Users size={15}/>{props.votes} votes</span>
            <span className="flex items-center gap-1.5"><MessageCircle size={15}/>{props.comments}</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold text-votely-purple hover:text-votely-deep">
            <Share2 size={15}/> Share
          </button>
        </div>
      </div>
    </article>
  );
}
