import { env } from "./env";
import { getCached, setCache, buildCacheKey } from "./cache";
import type {
  TMDBPaginatedResponse,
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBGenre,
  TMDBMultiResult,
  TMDBEpisode,
} from "./types";

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const cacheKey = buildCacheKey("tmdb", endpoint, JSON.stringify(params));
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const searchParams = new URLSearchParams({
    api_key: env.TMDB_API_KEY,
    language: "en-US",
    ...params,
  });

  const res = await fetch(`${env.TMDB_BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  const data = await res.json();
  setCache(cacheKey, data);
  return data as T;
}

export async function getTrending(
  mediaType: "movie" | "tv" | "all" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TMDBPaginatedResponse<TMDBMovie & TMDBTVShow>> {
  return fetchTMDB(`/trending/${mediaType}/${timeWindow}`);
}

export async function getPopularMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return fetchTMDB("/movie/popular", { page: String(page) });
}

export async function getTopRatedMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return fetchTMDB("/movie/top_rated", { page: String(page) });
}

export async function getUpcomingMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return fetchTMDB("/movie/upcoming", { page: String(page) });
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return fetchTMDB("/movie/now_playing", { page: String(page) });
}

export async function getPopularTV(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return fetchTMDB("/tv/popular", { page: String(page) });
}

export async function getTopRatedTV(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return fetchTMDB("/tv/top_rated", { page: String(page) });
}

export async function getMovieDetails(id: string): Promise<TMDBMovieDetails> {
  return fetchTMDB(`/movie/${id}`, { append_to_response: "credits,videos,similar,recommendations" });
}

export async function getTVDetails(id: string): Promise<TMDBTVDetails> {
  return fetchTMDB(`/tv/${id}`, { append_to_response: "credits,videos,similar,recommendations" });
}

export async function getTVSeasonDetails(tvId: string, seasonNumber: number): Promise<{ episodes: TMDBEpisode[] }> {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMulti(query: string, page = 1): Promise<TMDBPaginatedResponse<TMDBMultiResult>> {
  return fetchTMDB("/search/multi", { query, page: String(page) });
}

export async function getMoviesByGenre(genreId: string, page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return fetchTMDB("/discover/movie", { with_genres: genreId, page: String(page), sort_by: "popularity.desc" });
}

export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  return fetchTMDB("/genre/movie/list");
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  return fetchTMDB("/genre/tv/list");
}

export function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/no-image.svg";
  return `${env.TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string | null {
  if (!path) return null;
  return `${env.TMDB_IMAGE_BASE}/original${path}`;
}

export function getBlurDataUrl(): string {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQyIiBoZWlnaHQ9IjUxMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWMxYzFjIi8+PC9zdmc+";
}
