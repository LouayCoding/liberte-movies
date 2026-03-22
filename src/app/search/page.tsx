"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { MagnifyingGlass, Star, X, FilmSlate, Television, BookOpen, CircleNotch } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/tmdb";
import type { MangaDexManga } from "@/lib/manga-types";
import { getMangaDexTitle, getMangaDexCover } from "@/lib/manga-types";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  profile_path: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  overview?: string;
}

interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
}

type Tab = "all" | "movies" | "tv" | "manga";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mangaResults, setMangaResults] = useState<MangaDexManga[]>([]);
  const [loading, setLoading] = useState(false);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Trending content for empty state
  const [trendingMovies, setTrendingMovies] = useState<TrendingItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingItem[]>([]);
  const [topManga, setTopManga] = useState<MangaDexManga[]>([]);

  // Fetch trending on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

    fetch(`${baseUrl}/trending/movie/week?api_key=${apiKey}`)
      .then((r) => r.json())
      .then((d) => setTrendingMovies((d.results || []).slice(0, 10)))
      .catch(() => {});

    fetch(`${baseUrl}/trending/tv/week?api_key=${apiKey}`)
      .then((r) => r.json())
      .then((d) => setTrendingTV((d.results || []).slice(0, 10)))
      .catch(() => {});

    fetch("https://api.mangadex.org/manga?includes[]=cover_art&includes[]=author&order[followedCount]=desc&limit=10&contentRating[]=safe&contentRating[]=suggestive")
      .then((r) => r.json())
      .then((d) => setTopManga((d.data || []).slice(0, 10)))
      .catch(() => {});
  }, []);

  const fetchResults = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setMangaResults([]); return; }

    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
    fetch(`${baseUrl}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=en-US`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results?.filter((r: SearchResult) => r.media_type !== "person") || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    setMangaLoading(true);
    fetch(`https://api.mangadex.org/manga?includes[]=cover_art&includes[]=author&title=${encodeURIComponent(q)}&limit=24&contentRating[]=safe&contentRating[]=suggestive`)
      .then((r) => r.json())
      .then((d) => {
        setMangaResults(d.data || []);
        setMangaLoading(false);
      })
      .catch(() => setMangaLoading(false));
  }, []);

  useEffect(() => {
    if (query) fetchResults(query);
  }, [query, fetchResults]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput.trim() && searchInput !== query) {
        router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`, { scroll: false });
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput, query, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setResults([]);
    setMangaResults([]);
    setActiveTab("all");
    router.push("/search", { scroll: false });
    inputRef.current?.focus();
  };

  const filteredResults = activeTab === "movies"
    ? results.filter((r) => r.media_type === "movie")
    : activeTab === "tv"
    ? results.filter((r) => r.media_type === "tv")
    : results;

  const isLoading = activeTab === "manga" ? mangaLoading : loading;
  const totalResults = results.length + mangaResults.length;
  const movieCount = results.filter((r) => r.media_type === "movie").length;
  const tvCount = results.filter((r) => r.media_type === "tv").length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalResults },
    { id: "movies", label: "Movies", count: movieCount },
    { id: "tv", label: "TV", count: tvCount },
    { id: "manga", label: "Manga", count: mangaResults.length },
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24">
      {/* Sticky search bar */}
      <div className="sticky top-16 z-30 bg-[--background]/95 backdrop-blur-xl border-b border-white/[0.04] px-4 sm:px-6 py-3">
        <form onSubmit={handleSearch} className="max-w-[1400px] mx-auto">
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[--muted-dark] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search movies, TV shows, manga..."
              className="w-full bg-white/[0.05] border border-white/[0.08] text-white rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:border-[--accent]/40 focus:bg-white/[0.07] transition-all placeholder:text-[--muted-dark]"
              autoFocus
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[--muted-dark] hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
        {/* Tabs when searching */}
        {query && (
          <div className="flex gap-2 mt-4 mb-5 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-[--muted] hover:text-white hover:bg-white/[0.1]"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${activeTab === tab.id ? "text-black/50" : "text-[--muted-dark]"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <CircleNotch className="w-7 h-7 text-[--accent] animate-spin" />
          </div>
        )}

        {/* No results */}
        {!isLoading && query && (
          (activeTab === "manga" ? mangaResults.length === 0 : filteredResults.length === 0) && (
            <div className="text-center py-16">
              <p className="text-white/80 text-base font-medium">No results for &quot;{query}&quot;</p>
              <p className="text-[--muted-dark] text-sm mt-1">Try searching for something else</p>
            </div>
          )
        )}

        {/* TMDB Results */}
        {!isLoading && activeTab !== "manga" && filteredResults.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 mt-1">
            {filteredResults.map((item) => {
              const href = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
              const title = item.title || item.name || "Unknown";
              const imagePath = item.poster_path || item.profile_path;
              return (
                <Link key={`${item.media_type}-${item.id}`} href={href} className="group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 transition-all duration-300 group-hover:ring-2 group-hover:ring-white/20">
                    <Image
                      src={getImageUrl(imagePath, "w342")}
                      alt={title}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="180px"
                    />
                    <span className={`absolute top-1.5 left-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      item.media_type === "tv" ? "bg-blue-500/90" : "bg-[--accent]/90"
                    }`}>
                      {item.media_type === "tv" ? "TV" : "MOVIE"}
                    </span>
                  </div>
                  <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                    {title}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Manga Results */}
        {!mangaLoading && activeTab === "manga" && mangaResults.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 mt-1">
            {mangaResults.map((m) => (
              <Link key={m.id} href={`/manga/${m.id}`} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 transition-all duration-300 group-hover:ring-2 group-hover:ring-white/20">
                  <Image
                    src={getMangaDexCover(m, "256")}
                    alt={getMangaDexTitle(m)}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="180px"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    MANGA
                  </span>
                </div>
                <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                  {getMangaDexTitle(m)}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* All tab manga section */}
        {!mangaLoading && activeTab === "all" && mangaResults.length > 0 && query && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white tracking-tight">Manga</h2>
              {mangaResults.length > 6 && (
                <button onClick={() => setActiveTab("manga")} className="text-[--accent] text-xs font-medium">
                  See all
                </button>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {mangaResults.slice(0, 10).map((m) => (
                <Link key={m.id} href={`/manga/${m.id}`} className="shrink-0 w-[120px] group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 group-hover:ring-2 group-hover:ring-white/20 transition-all">
                    <Image
                      src={getMangaDexCover(m, "256")}
                      alt={getMangaDexTitle(m)}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                  <p className="text-white/70 text-[11px] font-medium line-clamp-1">{getMangaDexTitle(m)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===== EMPTY STATE: Trending content (Netflix style) ===== */}
        {!query && (
          <div className="mt-6 space-y-8">
            {/* Trending Movies */}
            {trendingMovies.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FilmSlate className="w-4 h-4 text-[--accent]" />
                  <h2 className="text-sm font-semibold text-white">Trending Movies</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {trendingMovies.map((m) => (
                    <Link key={m.id} href={`/movie/${m.id}`} className="shrink-0 w-[130px] sm:w-[150px] group">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 group-hover:ring-2 group-hover:ring-white/20 transition-all">
                        <Image
                          src={getImageUrl(m.poster_path, "w342")}
                          alt={m.title || ""}
                          fill
                          loading="lazy"
                          className="object-cover"
                          sizes="150px"
                        />
                      </div>
                      <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                        {m.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400" weight="fill" />
                        <span className="text-[--muted] text-[11px]">{(m.vote_average ?? 0).toFixed(1)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Trending TV */}
            {trendingTV.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Television className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">Trending TV Shows</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {trendingTV.map((s) => (
                    <Link key={s.id} href={`/tv/${s.id}`} className="shrink-0 w-[130px] sm:w-[150px] group">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 group-hover:ring-2 group-hover:ring-white/20 transition-all">
                        <Image
                          src={getImageUrl(s.poster_path, "w342")}
                          alt={s.name || ""}
                          fill
                          loading="lazy"
                          className="object-cover"
                          sizes="150px"
                        />
                      </div>
                      <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                        {s.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400" weight="fill" />
                        <span className="text-[--muted] text-[11px]">{(s.vote_average ?? 0).toFixed(1)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Top Manga */}
            {topManga.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white">Top Manga</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {topManga.map((m) => (
                    <Link key={m.id} href={`/manga/${m.id}`} className="shrink-0 w-[130px] sm:w-[150px] group">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 group-hover:ring-2 group-hover:ring-white/20 transition-all">
                        <Image
                          src={getMangaDexCover(m, "256")}
                          alt={getMangaDexTitle(m)}
                          fill
                          loading="lazy"
                          className="object-cover"
                          sizes="150px"
                        />
                      </div>
                      <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                        {getMangaDexTitle(m)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CircleNotch className="w-7 h-7 text-[--accent] animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
