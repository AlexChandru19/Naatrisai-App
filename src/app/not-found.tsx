import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "பக்கம் இல்லை · Page not found", robots: { index: false } };
export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <div className="text-6xl">🧭</div>
      <h1 className="mt-4 text-2xl font-extrabold">திசை தவறிவிட்டது · Page not found</h1>
      <p className="mt-2 opacity-70">இந்தப் பக்கம் இல்லை அல்லது நகர்த்தப்பட்டுள்ளது. · This page doesn’t exist or has moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-kumkum-600 px-5 py-2 font-bold text-white">முகப்பு · Home</Link>
        <Link href="/search" className="rounded-full border px-5 py-2 font-bold">🔍 தேடல் · Search</Link>
        <Link href="/topics" className="rounded-full border px-5 py-2 font-bold">🗂️ தலைப்புகள் · Topics</Link>
      </div>
    </div>
  );
}
