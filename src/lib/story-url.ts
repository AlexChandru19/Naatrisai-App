import type { Article } from "./types";
/** Full-coverage page link; carries the headline so the page still works after the story leaves the live pool. */
export const storyUrl = (a: Article) => `/story/${a.id}?${new URLSearchParams({ t: a.title.slice(0, 200), u: a.link, s: a.source, l: a.lang })}`;
