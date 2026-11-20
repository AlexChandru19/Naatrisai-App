import type { Metadata } from "next";
import { getAll } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { PhotoGrid } from "@/components/photo-grid";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "படச் செய்திகள் · In pictures",
  description: "Today's news in pictures from Tamil, Indian and world outlets.",
  alternates: { canonical: "/photos" },
};

export default async function PhotosPage() {
  const { articles } = await getAll();
  const seen = new Set<string>();
  const items = articles.filter((a) => a.image && !a.soft && !seen.has(a.image) && seen.add(a.image)).slice(0, 120).map((a) => ({ ...a, summary: "", cluster: undefined }));
  return (
    <>
      <PageTitle emoji="📸" ta="படச் செய்திகள்" en="In pictures" subTa="இன்றைய செய்திகள் படங்களில்" subEn="Today's news in pictures" />
      <div className="mt-5"><PhotoGrid items={items} /></div>
    </>
  );
}
