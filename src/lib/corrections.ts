/** Corrections log — Naatrisai's own mistakes (headlines are the publishers'; we never edit them). Newest first. */
export const CORRECTIONS: { date: string; ta: string; en: string }[] = [
  { date: "2026-11-20", ta: "தேர்வு நடப்பு நிகழ்வுகள் பக்கம் தங்க விலை, லாட்டரி, ரெய்டு செய்திகளைத் தவறான பாடப் பிரிவில் வைத்தது; வகைப்படுத்தல் விதிகள் திருத்தப்பட்டன.", en: "The exam digest filed gold-rate, lottery and raid stories under the wrong syllabus sections; the sorting rules were tightened." },
  { date: "2026-11-20", ta: "குரல் இல்லாத உலாவிகளில் செய்தி வாசிப்பு எல்லாச் செய்திகளையும் வேகமாகக் கடந்து சென்றது; இப்போது தெளிவான அறிவிப்புடன் இடைநிறுத்தப்படுகிறது.", en: "On browsers without speech voices the audio bulletin raced through every story; it now pauses with a clear notice." },
  { date: "2026-11-20", ta: "நிறுத்து (Stop) பொத்தான் அடுத்த செய்திக்குத் தாவியது; சரிசெய்யப்பட்டது.", en: "The audio Stop button skipped to the next story instead of stopping; fixed." },
];
export const CORRECTIONS_EMAIL = process.env.NEXT_PUBLIC_CORRECTIONS_EMAIL || "";
