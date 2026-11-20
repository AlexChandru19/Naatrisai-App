import Link from "next/link";
export const metadata = { title: "இணைப்பு இல்லை · Offline", robots: { index: false } };
export default function Offline() {
  return (
    <div className="py-20 text-center">
      <div className="text-6xl">📴</div>
      <h1 className="mt-4 text-2xl font-extrabold">இணைய இணைப்பு இல்லை · You’re offline</h1>
      <p className="mx-auto mt-2 max-w-md opacity-70">நீங்கள் முன்பு திறந்த பக்கங்களும் சேமித்த செய்திகளும் இணைப்பு இல்லாமலும் கிடைக்கும். · Pages you opened before and your saved stories still work offline.</p>
      <div className="mt-6 flex justify-center gap-3"><Link href="/saved" className="rounded-full bg-kumkum-600 px-5 py-2 font-bold text-white">🔖 சேமித்தவை · Saved</Link><Link href="/" className="rounded-full border px-5 py-2 font-bold">🏠 முகப்பு · Home</Link></div>
    </div>
  );
}
