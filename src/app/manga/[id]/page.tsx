"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarBlank } from "@/components/icons";
import type { MangaDexManga } from "@/lib/manga-types";
import {
  getMangaDexTitle,
  getMangaDexCover,
  getMangaDexAuthor,
  getMangaDexDescription,
  getMangaDexGenres,
} from "@/lib/manga-types";

const MANGADEX = "https://api.mangadex.org";
const INCLUDES = "includes[]=cover_art&includes[]=author";

export default function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [manga, setManga] = useState<MangaDexManga | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [mangaId, setMangaId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setMangaId(p.id));
  }, [params]);

  useEffect(() => {
    if (!mangaId) return;

    setLoading(true);
    fetch(`${MANGADEX}/manga/${mangaId}?${INCLUDES}`)
      .then((r) => r.json())
      .then((d) => {
        setManga(d.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mangaId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="relative w-full h-[40vh] bg-white/[0.02] animate-pulse" />
        <div className="relative -mt-40 z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="shrink-0 w-[220px] h-[330px] bg-white/[0.04] rounded-2xl animate-pulse" />
            <div className="flex-1 pt-4 space-y-4">
              <div className="h-10 w-80 max-w-full bg-white/[0.04] rounded-xl animate-pulse" />
              <div className="h-5 w-48 bg-white/[0.03] rounded-lg animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-7 w-20 bg-white/[0.04] rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="space-y-2 max-w-2xl">
                <div className="h-4 w-full bg-white/[0.04] rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-white/[0.04] rounded-lg animate-pulse" />
                <div className="h-4 w-3/4 bg-white/[0.03] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
        <p className="text-[--muted]">Manga not found.</p>
        <Link href="/manga" className="text-[--accent] text-sm mt-2 inline-block">Back to Manga</Link>
      </div>
    );
  }

  const coverUrl = getMangaDexCover(manga, "512");
  const displayTitle = getMangaDexTitle(manga);
  const author = getMangaDexAuthor(manga);
  const description = getMangaDexDescription(manga);
  const genres = getMangaDexGenres(manga);
  const { status, year, lastChapter, lastVolume, publicationDemographic, originalLanguage } = manga.attributes;

  return (
    <div>
      {/* Hero Backdrop */}
      <div className="relative w-full h-[40vh] overflow-hidden">
        <Image
          src={coverUrl}
          alt=""
          fill
          className="object-cover scale-110 blur-2xl opacity-30"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[--background] via-[--background]/60 to-[--background]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[--background]/80 via-transparent to-transparent" />

        <Link
          href="/manga"
          className="absolute top-20 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-all bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/15"
        >
          <ArrowLeft className="w-4 h-4" />
          Manga
        </Link>
      </div>

      {/* Content */}
      <div className="relative -mt-40 z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="shrink-0">
            <Image
              src={coverUrl}
              alt={displayTitle}
              width={220}
              height={330}
              className="rounded-2xl border border-white/[0.08] shadow-2xl"
              priority
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 tracking-tight">
              {displayTitle}
            </h1>
            {author && (
              <p className="text-[--muted] text-sm mb-4">by <span className="text-white">{author}</span></p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                status === "ongoing"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : status === "completed"
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-white/[0.06] text-[--muted]"
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              {year && <span className="text-[--muted] text-sm">{year}</span>}
              {originalLanguage && (
                <span className="text-[--muted-dark] text-xs uppercase">{originalLanguage}</span>
              )}
              {publicationDemographic && (
                <span className="text-[--muted] text-sm capitalize">{publicationDemographic}</span>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-[--muted]">
              {lastChapter && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {lastChapter} Chapters
                </div>
              )}
              {lastVolume && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {lastVolume} Volumes
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1.5">
                  <CalendarBlank className="w-4 h-4" />
                  {year}
                </div>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {genres.map((g) => (
                  <span key={g} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/[0.06] text-[--muted]">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="max-w-2xl mb-6">
                <p className={`text-white/65 text-sm leading-relaxed ${!showFullSynopsis ? "line-clamp-4" : ""}`}>
                  {description.replace(/\[.*?\]\(.*?\)/g, "").replace(/---[\s\S]*/g, "").trim()}
                </p>
                {description.length > 300 && (
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="text-[--accent] hover:text-[--accent-hover] text-sm mt-2 font-medium"
                  >
                    {showFullSynopsis ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {/* Available languages */}
            {manga.attributes.availableTranslatedLanguages?.length > 0 && (
              <p className="text-[--muted-dark] text-xs">
                Available in {manga.attributes.availableTranslatedLanguages.length} languages
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
