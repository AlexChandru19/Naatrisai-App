import type { Metadata } from "next";
import { SavedList } from "@/components/saved-list";
export const metadata: Metadata = { title: "சேமித்தவை · Saved", alternates: { canonical: "/saved" }, robots: { index: false } };
export default function Saved() { return <SavedList />; }
