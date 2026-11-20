import "server-only";

export type Holiday = { date: string; name: string; ta?: string; kind: "public" | "observance" };
// Tamil names for the festivals in Google's India calendar (names only — dates come from the feed).
const TA: Record<string, string> = {
  "New Year's Day": "ஆங்கிலப் புத்தாண்டு", Pongal: "பொங்கல்", "Makar Sankranti": "மகர சங்கராந்தி", "Republic Day": "குடியரசு தினம்", "Vasant Panchami": "வசந்த பஞ்சமி",
  "Maha Shivaratri": "மகா சிவராத்திரி", Holi: "ஹோலி", "Holika Dahana": "ஹோலிகா தகனம்", Ugadi: "யுகாதி", "Gudi Padwa": "குடி பட்வா", "Rama Navami": "ராம நவமி",
  "Mahavir Jayanti": "மகாவீர் ஜெயந்தி", "Good Friday": "புனித வெள்ளி", "Ambedkar Jayanti": "அம்பேத்கர் ஜெயந்தி", Vaisakhi: "வைசாகி", Vishu: "விஷு", "Ramzan Id": "ரம்ஜான்",
  "Ramzan Id (tentative)": "ரம்ஜான் (உத்தேசம்)", "Ramadan Start": "ரமலான் தொடக்கம்", "Ramadan Start (tentative)": "ரமலான் தொடக்கம் (உத்தேசம்)", "Buddha Purnima": "புத்த பூர்ணிமா",
  Bakrid: "பக்ரீத்", "Bakrid (tentative)": "பக்ரீத் (உத்தேசம்)", "Muharram/Ashura": "முஹர்ரம்", "Muharram/Ashura (tentative)": "முஹர்ரம் (உத்தேசம்)", "Independence Day": "சுதந்திர தினம்",
  "Raksha Bandhan": "ரக்ஷா பந்தன்", Janmashtami: "கிருஷ்ண ஜெயந்தி", "Janmashtami (Smarta)": "கிருஷ்ண ஜெயந்தி (ஸ்மார்த்த)", Onam: "ஓணம்", "Vinayaka Chathurthi": "விநாயகர் சதுர்த்தி",
  "Ganesh Chaturthi": "விநாயகர் சதுர்த்தி", "Milad un-Nabi": "மீலாது நபி", "Milad un-Nabi (tentative)": "மீலாது நபி (உத்தேசம்)", "Mahatma Gandhi Jayanti": "காந்தி ஜெயந்தி",
  Dussehra: "விஜயதசமி", "Maha Navami": "ஆயுத பூஜை / மகா நவமி", "Maha Ashtami": "மகா அஷ்டமி", "Maha Saptami": "மகா சப்தமி", "First Day of Sharad Navratri": "நவராத்திரி தொடக்கம்",
  "Diwali/Deepavali": "தீபாவளி", "Naraka Chaturdasi": "நரக சதுர்த்தசி", "Guru Nanak Jayanti": "குரு நானக் ஜெயந்தி", Christmas: "கிறிஸ்துமஸ்", "Christmas Eve": "கிறிஸ்துமஸ் முன்தினம்",
  "Karaka Chaturthi": "கர்வா சௌத்", "Chhat Puja (Pratihar Sashthi/Surya Sashthi)": "சத் பூஜை", Lohri: "லோஹ்ரி", "Parsi New Year": "பார்சி புத்தாண்டு", "Maharishi Valmiki Jayanti": "வால்மீகி ஜெயந்தி",
};

/** National holidays & observances from Google's public "Holidays in India" calendar (ICS). */
export async function getHolidays(): Promise<{ list: Holiday[]; ok: boolean }> {
  try {
    const r = await fetch("https://calendar.google.com/calendar/ical/en.indian%23holiday%40group.v.calendar.google.com/public/basic.ics", { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw 0;
    const ics = (await r.text()).replace(/\r?\n[ \t]/g, "");
    const list = [...ics.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)].map((m) => {
      const e = m[1];
      const d = e.match(/DTSTART;VALUE=DATE:(\d{4})(\d{2})(\d{2})/);
      const name = (e.match(/\nSUMMARY:(.*)/)?.[1] ?? "").replace(/\\,/g, ",").trim();
      const kind: Holiday["kind"] = /DESCRIPTION:Public holiday/.test(e) ? "public" : "observance";
      return d && name ? ({ date: `${d[1]}-${d[2]}-${d[3]}`, name, ta: TA[name] as string | undefined, kind } as Holiday) : null;
    }).filter((h): h is Holiday => !!h).sort((a, b) => a.date.localeCompare(b.date));
    return { list, ok: list.length > 0 };
  } catch { return { list: [], ok: false }; }
}

export type Otd = { year: number; text: string; link?: string; thumb?: string; india: boolean };
/** Wikipedia's "On this day" selected events (CC BY-SA), for the IST calendar date. */
export async function getOnThisDay(): Promise<{ items: Otd[]; date: string; ok: boolean }> {
  const ist = new Date(Date.now() + 5.5 * 3600e3);
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0"), dd = String(ist.getUTCDate()).padStart(2, "0");
  try {
    const r = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${mm}/${dd}`, { next: { revalidate: 21600 }, headers: { "User-Agent": "Naatrisai/1.0 (https://naatrisai.vercel.app)" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw 0;
    const j = (await r.json()) as { selected?: { year: number; text: string; pages?: { content_urls?: { desktop?: { page?: string } }; thumbnail?: { source: string } }[] }[] };
    const items = (j.selected ?? []).map((s) => ({
      year: s.year, text: s.text.replace(/\s+/g, " ").trim(), link: s.pages?.[0]?.content_urls?.desktop?.page, thumb: s.pages?.find((p) => p.thumbnail)?.thumbnail?.source,
      india: /India|Indian|Tamil|Madras|Chennai|Ceylon|Sri Lanka|Mughal|Bengal|Bombay|Delhi|Gandhi|Nehru/i.test(s.text),
    })).sort((a, b) => Number(b.india) - Number(a.india) || b.year - a.year);
    return { items, date: `${ist.getUTCFullYear()}-${mm}-${dd}`, ok: items.length > 0 };
  } catch { return { items: [], date: `${ist.getUTCFullYear()}-${mm}-${dd}`, ok: false }; }
}
export const istDate = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
