import { wordOfDay } from "@/lib/words";
/** Server-rendered daily Tamil word card. */
export function WordOfDay({ day }: { day: string }) {
  const w = wordOfDay(day);
  return (
    <section data-word className="rounded-2xl border border-manjal-400/50 bg-manjal-300/15 p-4">
      <div className="text-xs font-extrabold uppercase tracking-wide opacity-80">📖 இன்றைய தமிழ்ச் சொல் · Tamil word of the day</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3"><span lang="ta" className="text-3xl font-black">{w.ta}</span><span className="text-sm italic opacity-80">{w.tr}</span></div>
      <p className="mt-1 font-bold">{w.en}</p>
      <p lang="ta" className="mt-1 text-sm opacity-85">“{w.use}”</p>
    </section>
  );
}
