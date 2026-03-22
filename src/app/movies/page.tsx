"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, CircleNotch, MagnifyingGlass, X } from "@/components/icons";
import { getImageUrl } from "@/lib/tmdb";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

interface Genre {
  id: number;
  name: string;
}

type SortOption = "popularity.desc" | "vote_average.desc" | "release_date.desc" | "revenue.desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "release_date.desc", label: "New" },
  { value: "revenue.desc", label: "Revenue" },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("popularity.desc");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[] | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const initialLoad = useRef(true);

  const fetchMovies = useCallback(async (pageNum: number, sort: string, genre: string) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

    const params = new URLSearchParams({
      api_key: apiKey || "",
      language: "en-US",
      page: String(pageNum),
      sort_by: sort,
      "vote_count.gte": sort === "vote_average.desc" ? "200" : "0",
    });
    if (genre) params.set("with_genres", genre);

    const res = await fetch(`${baseUrl}/discover/movie?${params}`);
    return res.json();
  }, []);

  const resetAndFetch = useCallback(() => {
    setLoading(true);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setSearchResults(null);
    setSearchInput("");
    fetchMovies(1, sortBy, selectedGenre).then((data) => {
      setMovies(data.results || []);
      setHasMore(data.page < data.total_pages);
      setLoading(false);
    });
  }, [sortBy, selectedGenre, fetchMovies]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

    Promise.all([
      fetchMovies(1, sortBy, selectedGenre),
      fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}&language=en-US`).then((r) => r.json()),
    ]).then(([moviesData, genresData]) => {
      setMovies(moviesData.results || []);
      setGenres(genresData.genres || []);
      setHasMore(moviesData.page < moviesData.total_pages);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    resetAndFetch();
  }, [sortBy, selectedGenre]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!val.trim()) { setSearchResults(null); return; }
    searchTimeout.current = setTimeout(() => {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
      fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(val.trim())}&language=en-US`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.results || []))
        .catch(() => {});
    }, 400);
  };

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading || searchResults) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          fetchMovies(nextPage, sortBy, selectedGenre).then((data) => {
            setMovies((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newMovies = (data.results || []).filter(
                (m: Movie) => !existingIds.has(m.id)
              );
              return [...prev, ...newMovies];
            });
            setPage(nextPage);
            setHasMore(data.page < data.total_pages);
            setLoadingMore(false);
          });
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading, loadingMore, sortBy, selectedGenre, fetchMovies, searchResults]);

  const displayMovies = searchResults ?? movies;

  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24">
        <div className="sticky top-16 z-30 bg-[--background]/95 backdrop-blur-xl border-b border-white/[0.04] px-4 sm:px-6 py-3">
          <div className="max-w-[1400px] mx-auto">
            <div className="h-10 w-full bg-white/[0.04] rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4">
          <div className="flex gap-2 mb-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-24 shrink-0 bg-white/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="flex gap-1.5 mb-5 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-7 w-20 shrink-0 bg-white/[0.03] rounded-md animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] bg-white/[0.04] rounded-lg animate-pulse" />
                <div className="mt-1.5 h-3 w-3/4 bg-white/[0.03] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24">
      {/* Sticky search bar */}
      <div className="sticky top-16 z-30 bg-[--background]/95 backdrop-blur-xl border-b border-white/[0.04] px-4 sm:px-6 py-3">
        <div className="max-w-[1400px] mx-auto relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[--muted-dark] pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search movies..."
            className="w-full bg-white/[0.05] border border-white/[0.08] text-white rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:border-[--accent]/40 focus:bg-white/[0.07] transition-all placeholder:text-[--muted-dark]"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearchResults(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[--muted-dark] hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
        {/* Sort tabs */}
        <div className="flex gap-2 mt-4 mb-2 overflow-x-auto scrollbar-hide">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                sortBy === opt.value && !searchResults
                  ? "bg-white text-black"
                  : "bg-white/[0.06] text-[--muted] hover:text-white hover:bg-white/[0.1]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Genre sub-tabs */}
        {genres.length > 0 && (
          <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedGenre("")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                !selectedGenre ? "bg-white/[0.12] text-white" : "text-[--muted] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              All
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(String(g.id))}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedGenre === String(g.id) ? "bg-white/[0.12] text-white" : "text-[--muted] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {/* Movie Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {displayMovies.map((movie) => (
            <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 transition-all group-hover:ring-2 group-hover:ring-white/20">
                <Image
                  src={getImageUrl(movie.poster_path, "w342")}
                  alt={movie.title}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="180px"
                />
              </div>
              <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                {movie.title}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-400" weight="fill" />
                <span className="text-[--muted] text-[11px]">{(movie.vote_average ?? 0).toFixed(1)}</span>
                {movie.release_date && (
                  <span className="text-[--muted-dark] text-[11px]">· {new Date(movie.release_date).getFullYear()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Infinite Scroll */}
        {!searchResults && (
          <div ref={loaderRef} className="flex justify-center py-10">
            {loadingMore && <CircleNotch className="w-6 h-6 text-[--accent] animate-spin" />}
          </div>
        )}
      </div>
    </div>
  );
}
