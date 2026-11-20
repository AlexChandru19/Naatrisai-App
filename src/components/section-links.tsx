"use client";
import Link from "next/link";
import { usePrefs } from "./providers";

export function SectionLinks({ counts }: { counts: { tn: number; india: number; world: number } }) {
  const { lang } = usePrefs();
  const items = [
    { href: "/tamilnadu", ta: "தமிழ்நாடு", en: "Tamil Nadu", n: counts.tn, c: "from-kumkum-600 to-kumkum-500", e: "🛕" },
    { href: "/india", ta: "இந்தியா", en: "India", n: counts.india, c: "from-manjal-500 to-orange-500", e: "🇮🇳" },
    { href: "/world", ta: "உலகம்", en: "World", n: counts.world, c: "from-peacock-600 to-sky-500", e: "🌍" },
  ];
  return (
    <div className="no-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 py-1">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r ${i.c} px-3 py-1.5 text-[13px] font-bold sm:px-3.5 sm:text-sm text-white shadow-md transition hover:-translate-y-0.5`}>
          <span>{i.e}</span>{lang === "ta" ? i.ta : i.en}<span className="rounded-full bg-white/25 px-1.5 text-xs">{i.n}</span>
        </Link>
      ))}
    </div>
  );
}
