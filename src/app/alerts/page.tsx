import type { Metadata } from "next";
import { getAlerts } from "@/lib/alerts";
import { getTopic } from "@/lib/news";
import { PageTitle } from "@/components/hero";
import { AlertList } from "@/components/alerts-view";
import { WeatherWidget } from "@/components/weather";
import { Explorer } from "@/components/explorer";
import { L } from "@/components/providers";
import { When } from "@/components/money";

export const revalidate = 600;
export const metadata: Metadata = {
  title: "வானிலை & பேரிடர் எச்சரிக்கைகள் · Weather & disaster alerts",
  description: "Official IMD and disaster-management alerts for Tamil Nadu districts and the rest of India, from NDMA's SACHET public alert feed.",
  alternates: { canonical: "/alerts" },
};

export default async function AlertsPage() {
  const [a, wx] = await Promise.all([getAlerts(), getTopic("weather")]);
  return (
    <>
      <PageTitle emoji="⚠️" ta="வானிலை & பேரிடர் எச்சரிக்கைகள்" en="Weather & disaster alerts" subTa="இந்திய வானிலை ஆய்வு மையம் (IMD) மற்றும் பேரிடர் மேலாண்மை அமைப்புகளின் அதிகாரப்பூர்வ எச்சரிக்கைகள்" subEn="Official alerts from IMD and disaster-management authorities" />
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-xl font-extrabold">🛕 <L ta="தமிழ்நாடு — இப்போது அமலில்" en="Tamil Nadu — active now" /> <span className="text-base opacity-60">({a.tn.length})</span></h2>
            {!a.ok ? <p className="rounded-2xl border p-4 text-sm opacity-75"><L ta="எச்சரிக்கை ஊட்டத்தை இப்போது பெற முடியவில்லை. சற்று நேரம் கழித்துப் பாருங்கள்." en="Couldn't reach the alert feed right now. Please check back shortly." /></p>
              : <AlertList items={a.tn} empty={{ ta: "தமிழ்நாட்டுக்கு இப்போது அமலில் உள்ள எச்சரிக்கைகள் இல்லை. ✅", en: "No active alerts for Tamil Nadu right now. ✅" }} />}
          </section>
          {a.tnRecent.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-extrabold">🕘 <L ta="தமிழ்நாடு — சமீபத்தில் முடிந்தவை" en="Tamil Nadu — recently expired" /></h2>
              <AlertList items={a.tnRecent} expired />
            </section>
          )}
          {a.india.length > 0 && (
            <details className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
              <summary className="cursor-pointer text-lg font-extrabold">🇮🇳 <L ta={`பிற மாநிலங்கள் — கடந்த 36 மணி நேரம் (${a.india.length})`} en={`Other states — last 36 hours (${a.india.length})`} /></summary>
              <div className="mt-3"><AlertList items={a.india} /></div>
            </details>
          )}
          <p className="text-xs opacity-65"><L ta="மூலம்: NDMA SACHET பொது எச்சரிக்கை ஊட்டம் (CAP). தலைப்புகள் வெளியிட்டபடியே ஆங்கிலத்தில் உள்ளன. அவசரத்தில் 112 / 1070 (மாநிலக் கட்டுப்பாட்டு அறை) அழைக்கவும்; அதிகாரிகளின் அறிவுறுத்தல்களைப் பின்பற்றவும்." en="Source: NDMA SACHET public alert feed (Common Alerting Protocol). Headlines are shown as published. In an emergency call 112 / 1070 (state control room) and follow official instructions." /> · <When t={a.fetchedAt} /></p>
          <div>
            <h2 className="mb-3 text-xl font-extrabold">🌧️ <L ta="வானிலைச் செய்திகள்" en="Weather news" /></h2>
            <Explorer articles={wx.articles.slice(0, 80)} fetchedAt={wx.fetchedAt} showTopics={false} />
          </div>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start"><WeatherWidget /></aside>
      </div>
    </>
  );
}
