"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleNotch, MagnifyingGlass, X } from "@/components/icons";
import type { MangaDexManga, MangaDexTag } from "@/lib/manga-types";
import { getMangaDexTitle, getMangaDexCover, getMangaDexAuthor } from "@/lib/manga-types";

const MANGADEX = "https://api.mangadex.org";
const INCLUDES = "includes[]=cover_art&includes[]=author";

type SortType = "followedCount" | "latestUploadedChapter" | "createdAt" | "relevance";

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "followedCount", label: "Popular" },
  { value: "latestUploadedChapter", label: "Latest" },
  { value: "createdAt", label: "New" },
  { value: "relevance", label: "Relevant" },
];

export default function MangaPage() {
  const [manga, setManga] = useState<MangaDexManga[]>([]);
  const [tags, setTags] = useState<MangaDexTag[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>("followedCount");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<MangaDexManga[] | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const initialLoad = useRef(true);
  const LIMIT = 30;

  const buildUrl = useCallback((off: number, sort: SortType, tagId: string) => {
    const params = new URLSearchParams({
      limit: String(LIMIT),
      offset: String(off),
      "contentRating[]": "safe",
    });
    params.append("contentRating[]", "suggestive");
    if (tagId) params.set("includedTags[]", tagId);
    if (sort !== "relevance") params.set(`order[${sort}]`, "desc");
    return `${MANGADEX}/manga?${INCLUDES}&${params}`;
  }, []);

  const fetchManga = useCallback(async (off: number, sort: SortType, tagId: string) => {
    const res = await fetch(buildUrl(off, sort, tagId));
    return res.json();
  }, [buildUrl]);

  const resetAndFetch = useCallback(() => {
    setLoading(true);
    setManga([]);
    setOffset(0);
    setSearchResults(null);
    setSearchInput("");
    fetchManga(0, sortBy, selectedTag).then((data) => {
      setManga(data.data || []);
      setTotal(data.total || 0);
      setOffset(data.data?.length || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sortBy, selectedTag, fetchManga]);

  // Initial load
  useEffect(() => {
    Promise.all([
      fetchManga(0, "followedCount", ""),
      fetch(`${MANGADEX}/manga/tag`).then((r) => r.json()),
    ]).then(([mangaData, tagsData]) => {
      setManga(mangaData.data || []);
      setTotal(mangaData.total || 0);
      setOffset(mangaData.data?.length || 0);
      // Filter to genre+theme tags and sort alphabetically
      const allTags = (tagsData.data || []) as MangaDexTag[];
      setTags(
        allTags
          .filter((t: MangaDexTag) => t.attributes.group === "genre" || t.attributes.group === "theme")
          .sort((a: MangaDexTag, b: MangaDexTag) => (a.attributes.name.en || "").localeCompare(b.attributes.name.en || ""))
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    resetAndFetch();
  }, [sortBy, selectedTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!val.trim()) { setSearchResults(null); return; }
    searchTimeout.current = setTimeout(() => {
      const params = new URLSearchParams({
        title: val.trim(),
        limit: "30",
        "contentRating[]": "safe",
      });
      params.append("contentRating[]", "suggestive");
      fetch(`${MANGADEX}/manga?${INCLUDES}&${params}`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.data || []))
        .catch(() => {});
    }, 400);
  };

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current || loading || searchResults) return;
    if (offset >= total && total > 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && offset < total) {
          setLoadingMore(true);
          fetchManga(offset, sortBy, selectedTag).then((data) => {
            const newItems = (data.data || []) as MangaDexManga[];
            setManga((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              return [...prev, ...newItems.filter((m) => !existingIds.has(m.id))];
            });
            setOffset((prev) => prev + newItems.length);
            setLoadingMore(false);
          }).catch(() => setLoadingMore(false));
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [offset, total, loading, loadingMore, sortBy, selectedTag, fetchManga, searchResults]);

  const displayManga = searchResults ?? manga;

  if (loading && manga.length === 0) {
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
            placeholder="Search manga..."
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

        {/* Genre/Theme tags */}
        {tags.length > 0 && (
          <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedTag("")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                !selectedTag ? "bg-white/[0.12] text-white" : "text-[--muted] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTag === tag.id ? "bg-white/[0.12] text-white" : "text-[--muted] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {tag.attributes.name.en}
              </button>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && displayManga.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/80 text-base font-medium">No manga found</p>
            <p className="text-[--muted-dark] text-sm mt-1">Try different filters or search terms</p>
          </div>
        )}

        {/* Manga Grid */}
        {displayManga.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {displayManga.map((m) => (
              <Link key={m.id} href={`/manga/${m.id}`} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] mb-1.5 transition-all group-hover:ring-2 group-hover:ring-white/20">
                  <Image
                    src={getMangaDexCover(m, "256")}
                    alt={getMangaDexTitle(m)}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="180px"
                  />
                  {m.attributes.status === "ongoing" && (
                    <span className="absolute top-1.5 left-1.5 bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Ongoing
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                  {getMangaDexTitle(m)}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {getMangaDexAuthor(m) && (
                    <span className="text-[--muted] text-[11px] line-clamp-1">{getMangaDexAuthor(m)}</span>
                  )}
                  {m.attributes.year && (
                    <span className="text-[--muted-dark] text-[11px]">· {m.attributes.year}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

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
