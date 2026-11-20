import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "நாற்றிசை · Naatrisai — Tamil, India & World news",
    short_name: "நாற்றிசை",
    description: "நாற்றிசைச் செய்திகளும் ஒரே இடத்தில் — live Tamil Nadu, India and world headlines in Tamil and English.",
    id: "/", start_url: "/?source=pwa", scope: "/", display_override: ["standalone", "minimal-ui"], prefer_related_applications: false, display: "standalone", orientation: "portrait",
    background_color: "#f6f5f2", theme_color: "#c8321a", lang: "ta", dir: "ltr", categories: ["news", "finance", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "உங்களுக்காக · For You", url: "/for-you" },
      { name: "இன்றைய சுருக்கம் · Briefing", url: "/briefing" },
      { name: "நேரலை டிவி · Live TV", url: "/live" },
      { name: "எச்சரிக்கைகள் · Alerts", url: "/alerts" },
      { name: "தங்கம் · எரிபொருள் · Gold & fuel", url: "/markets" },
      { name: "WhatsApp சுருக்கம் · Bulletin", url: "/bulletin" },
      { name: "பஞ்சாங்கம் · Panchangam", url: "/panchangam" },
      { name: "விளையாட்டு · Sports", url: "/sports" },
      { name: "சேமித்தவை · Saved", url: "/saved" },
    ],
  };
}
