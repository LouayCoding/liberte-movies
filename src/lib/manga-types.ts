// ── MangaDex API Types ──

export interface MangaDexTag {
  id: string;
  type: "tag";
  attributes: {
    name: Record<string, string>;
    group: string;
  };
}

export interface MangaDexRelationship {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  related?: string;
}

export interface MangaDexManga {
  id: string;
  type: "manga";
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    description: Record<string, string>;
    status: "ongoing" | "completed" | "hiatus" | "cancelled";
    year: number | null;
    contentRating: "safe" | "suggestive" | "erotica" | "pornographic";
    tags: MangaDexTag[];
    originalLanguage: string;
    lastChapter: string | null;
    lastVolume: string | null;
    publicationDemographic: string | null;
    state: string;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string | null;
    createdAt: string;
    updatedAt: string;
  };
  relationships: MangaDexRelationship[];
}

export interface MangaDexResponse {
  result: string;
  data: MangaDexManga[];
  limit: number;
  offset: number;
  total: number;
}

export interface MangaDexSingleResponse {
  result: string;
  data: MangaDexManga;
}

// ── Helpers ──

export function getMangaDexTitle(manga: MangaDexManga): string {
  const attrs = manga.attributes;
  // Try English alt title first
  for (const alt of attrs.altTitles) {
    if (alt.en) return alt.en;
  }
  // Then main title
  if (attrs.title.en) return attrs.title.en;
  // Fallback to romanized or first available
  const keys = Object.keys(attrs.title);
  for (const k of keys) {
    if (k.includes("ro") || k === "ja-ro" || k === "ko-ro") return attrs.title[k];
  }
  return attrs.title[keys[0]] || "Unknown";
}

export function getMangaDexCover(manga: MangaDexManga, size: "256" | "512" = "512"): string {
  const coverRel = manga.relationships.find((r) => r.type === "cover_art");
  if (!coverRel?.attributes?.fileName) return "/no-image.svg";
  return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.${size}.jpg`;
}

export function getMangaDexAuthor(manga: MangaDexManga): string {
  const author = manga.relationships.find((r) => r.type === "author");
  if (!author?.attributes?.name) return "";
  return author.attributes.name as string;
}

export function getMangaDexDescription(manga: MangaDexManga): string {
  const desc = manga.attributes.description;
  return desc.en || desc[Object.keys(desc)[0]] || "";
}

export function getMangaDexGenres(manga: MangaDexManga): string[] {
  return manga.attributes.tags
    .filter((t) => t.attributes.group === "genre" || t.attributes.group === "theme")
    .map((t) => t.attributes.name.en || "")
    .filter(Boolean);
}
