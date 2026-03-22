import type { MangaDexResponse, MangaDexSingleResponse, MangaDexTag } from "./manga-types";

const MANGADEX_BASE = "https://api.mangadex.org";
const INCLUDES = "includes[]=cover_art&includes[]=author";

export async function fetchMangaDex(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<MangaDexResponse> {
  const searchParams = new URLSearchParams(params);
  const sep = endpoint.includes("?") ? "&" : "?";
  const url = `${MANGADEX_BASE}${endpoint}${sep}${INCLUDES}&${searchParams}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`MangaDex API error: ${res.status}`);
  return res.json() as Promise<MangaDexResponse>;
}

export async function getPopularManga(offset = 0, limit = 30): Promise<MangaDexResponse> {
  return fetchMangaDex("/manga", {
    "order[followedCount]": "desc",
    "contentRating[]": "safe,suggestive",
    limit: String(limit),
    offset: String(offset),
  });
}

export async function getLatestManga(offset = 0, limit = 30): Promise<MangaDexResponse> {
  return fetchMangaDex("/manga", {
    "order[latestUploadedChapter]": "desc",
    "contentRating[]": "safe,suggestive",
    hasAvailableChapters: "true",
    limit: String(limit),
    offset: String(offset),
  });
}

export async function getRecentlyAddedManga(offset = 0, limit = 30): Promise<MangaDexResponse> {
  return fetchMangaDex("/manga", {
    "order[createdAt]": "desc",
    "contentRating[]": "safe,suggestive",
    limit: String(limit),
    offset: String(offset),
  });
}

export async function searchMangaDex(query: string, offset = 0, limit = 30): Promise<MangaDexResponse> {
  return fetchMangaDex("/manga", {
    title: query,
    "contentRating[]": "safe,suggestive",
    limit: String(limit),
    offset: String(offset),
  });
}

export async function getMangaDexById(id: string): Promise<MangaDexSingleResponse> {
  const res = await fetch(`${MANGADEX_BASE}/manga/${id}?${INCLUDES}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`MangaDex API error: ${res.status}`);
  return res.json() as Promise<MangaDexSingleResponse>;
}

export async function getMangaDexTags(): Promise<MangaDexTag[]> {
  const res = await fetch(`${MANGADEX_BASE}/manga/tag`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []) as MangaDexTag[];
}
