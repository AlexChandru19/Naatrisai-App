"use client";
import { usePrefs, type Follows } from "./providers";

export function FollowButton({ kind, value, label }: { kind: keyof Follows; value: string; label?: string }) {
  const { follows, toggleFollow, lang, ready } = usePrefs();
  const on = ready && follows[kind].includes(value);
  return (
    <button onClick={() => toggleFollow(kind, value)} aria-pressed={on} className={`rounded-full px-4 py-2 text-sm font-extrabold shadow-sm transition active:scale-95 ${on ? "bg-peacock-600 text-white" : "border border-kumkum-600 bg-white text-kumkum-700 hover:bg-kumkum-50 dark:border-manjal-400 dark:bg-transparent dark:text-manjal-400"}`}>
      {on ? "✓ " : "＋ "}{on ? (lang === "ta" ? "பின்தொடர்கிறீர்கள்" : "Following") : (lang === "ta" ? "பின்தொடர்" : "Follow")}{label ? ` ${label}` : ""}
    </button>
  );
}
