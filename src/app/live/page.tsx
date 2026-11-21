import type { Metadata } from "next";
import { CHANNELS, getVideos, getLiveInfo } from "@/lib/youtube";
import { PageTitle } from "@/components/hero";
import { LiveTV } from "@/components/live-tv";

export const revalidate = 180;
export const metadata: Metadata = { title: "நேரலை டிவி · Live TV", description: "Watch Tamil news channels live — Thanthi TV, Puthiya Thalaimurai, Polimer, News7 Tamil, Sun News and more — via their official YouTube streams.", alternates: { canonical: "/live" } };

export default async function LivePage() {
  const videos = await getVideos();
  const live = await getLiveInfo(videos);
  return (
    <>
      <PageTitle emoji="📺" ta="நேரலை டிவி & வீடியோ" en="Live TV & videos" subTa="தமிழ்ச் செய்தி சேனல்களின் அதிகாரப்பூர்வ YouTube நேரலை · சமீபத்திய வீடியோக்கள்" subEn="Official YouTube live streams of Tamil news channels · latest uploads" />
      <LiveTV channels={CHANNELS} videos={videos} live={live} />
    </>
  );
}
