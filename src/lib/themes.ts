/** Appearance options shared by the pre-paint script (layout) and Settings. Colours live in globals.css. */
export type ThemeId = "kumkum" | "sepia" | "midnight" | "amoled" | "marina" | "nilgiri" | "tanjore" | "hc";
export const THEMES: { id: ThemeId; ta: string; en: string; dark: boolean; meta: string; sw: [string, string, string, string] }[] = [
  // sw = [page background, card, accent, text]
  { id: "kumkum", ta: "கிளாசிக் குங்குமம்", en: "Classic Kumkum", dark: false, meta: "#c8321a", sw: ["#f6f5f2", "#ffffff", "#c8321a", "#13121f"] },
  { id: "sepia", ta: "காலை நாளிதழ் (செபியா)", en: "Morning Paper", dark: false, meta: "#9a4320", sw: ["#f3ead6", "#fbf5e6", "#9a4320", "#3a2c1c"] },
  { id: "midnight", ta: "நள்ளிரவு ஸ்லேட்", en: "Midnight Slate", dark: true, meta: "#0b1120", sw: ["#0b1120", "#141d30", "#f4694a", "#e2e8f0"] },
  { id: "amoled", ta: "AMOLED கருப்பு", en: "AMOLED Black", dark: true, meta: "#000000", sw: ["#000000", "#0b0b0b", "#fbbf24", "#f2f2f2"] },
  { id: "marina", ta: "மெரினா கடல்", en: "Marina Ocean", dark: false, meta: "#0b6a9c", sw: ["#eef6fa", "#ffffff", "#0b6a9c", "#0b2838"] },
  { id: "nilgiri", ta: "நீலகிரி காடு", en: "Nilgiri Forest", dark: false, meta: "#23794a", sw: ["#eef4ee", "#ffffff", "#23794a", "#15291d"] },
  { id: "tanjore", ta: "தஞ்சை அரச", en: "Royal Tanjore", dark: false, meta: "#7d1f2f", sw: ["#f5ede3", "#fffaf3", "#7d1f2f", "#2b1512"] },
  { id: "hc", ta: "அதிக வேறுபாடு", en: "High Contrast", dark: false, meta: "#000000", sw: ["#ffffff", "#ffffff", "#9b0000", "#000000"] },
];
export type Density = "compact" | "comfortable" | "spacious";
export type CardStyle = "standard" | "list" | "magazine";
export type Thumbs = "full" | "small" | "none";
export type FontStyle = "sans" | "serif" | "atkinson";
export const APPEARANCE_KEYS = ["ns-theme", "ns-density", "ns-cards", "ns-thumbs", "ns-font", "ns-view", "ns-size", "ns-readable"] as const;

/** Runs in <head> before paint: theme, dark class, density/cards/thumbs/font classes, text size, modes. Keep ES5. */
export const PREPAINT = `try{var d=document.documentElement,g=function(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return localStorage.getItem(k)}};
var T=${JSON.stringify(Object.fromEntries(THEMES.map((t) => [t.id, [t.dark ? 1 : 0, t.meta]])))};
var t=localStorage.getItem('ns-theme');if(t==='dark')t='midnight';if(t==='light')t='kumkum';
if(!T[t])t=matchMedia('(prefers-color-scheme: dark)').matches?'midnight':'kumkum';
d.setAttribute('data-theme',t);if(T[t][0])d.classList.add('dark');d.style.colorScheme=T[t][0]?'dark':'light';
document.querySelectorAll('meta[name=theme-color]').forEach(function(m){m.setAttribute('content',T[t][1]);m.removeAttribute('media')});
var dn=g('ns-density');if(dn==='compact'||dn==='spacious')d.classList.add('dn-'+dn);
var cs=g('ns-cards');if(cs==='list'||cs==='magazine')d.classList.add('cs-'+cs);
var th=g('ns-thumbs');if(th==='small'||th==='none')d.classList.add('th-'+th);
var f=g('ns-font');if(!f&&g('ns-readable'))f='atkinson';if(f==='serif')d.classList.add('ff-serif');if(f==='atkinson')d.classList.add('readable');
var l=localStorage.getItem('ns-lang');if(l)d.lang=l;var s=g('ns-size');if(s&&s!=='m')d.classList.add('ts-'+s);if(g('ns-simple'))d.classList.add('simple');if(g('ns-lite'))d.classList.add('lite');(g('ns-mods')||[]).forEach(function(x){d.classList.add('hm-'+x)})}catch(e){}`.replace(/\n/g, "");
