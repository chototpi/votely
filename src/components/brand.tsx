import { Check } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 text-white shadow-lg shadow-violet-200">
        <Check size={25} strokeWidth={3.4} />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[22px] font-extrabold tracking-tight text-votely-ink">votely<span className="text-votely-purple">.</span></div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.19em] text-slate-400">Every voice matters</div>
        </div>
      )}
    </div>
  );
}
