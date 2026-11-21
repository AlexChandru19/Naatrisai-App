import { getVideos, getLiveInfo } from "@/lib/youtube";

/** Which Tamil news channels are live on YouTube right now (resolved from each channel's public /live page). */
export const revalidate = 180;
export async function GET() {
  const live = await getLiveInfo(await getVideos());
  return Response.json({ checkedAt: new Date().toISOString(), channels: live.map(({ fallback, ...l }) => ({ ...l, fallback: fallback?.id ?? null })) });
}
