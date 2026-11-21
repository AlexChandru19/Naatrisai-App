/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL in Vercel (e.g. https://naatrisai.in); falls back to the vercel.app URL. */
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://naatrisai.vercel.app").replace(/\/$/, "");
export const SITE_HOST = SITE.replace(/^https?:\/\//, "");
