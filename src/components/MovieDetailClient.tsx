"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Star } from "@/components/icons";
import WatchlistButton from "./WatchlistButton";
import TrailerModal from "./TrailerModal";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getMovieEmbedUrl } from "@/lib/vidsrc";
import { getImageUrl } from "@/lib/tmdb";

interface MovieDetailClientProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  trailerKey: string | null;
  movieId: string;
  year: number | null;
  runtime: number;
  directorName: string | null;
  tagline: string | null;
  overview: string | null;
  genres: { id: number; name: string }[];
}

export default function MovieDetailClient({
  id,
  title,
  posterPath,
  voteAverage,
  trailerKey,
  movieId,
  year,
  runtime,
  directorName,
  tagline,
  overview,
  genres,
}: MovieDetailClientProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const { addToRecent } = useRecentlyViewed();

  useEffect(() => {
    addToRecent({ id, title, posterPath, mediaType: "movie", voteAverage });
  }, [id, title, posterPath, voteAverage, addToRecent]);

  return (
    <>
      {/* ── Video player — always visible ── */}
      <div className="-mt-24 sm:-mt-36 rounded-xl overflow-hidden border border-white/[0.06]">
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={getMovieEmbedUrl(movieId)}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
          />
        </div>
      </div>

      {/* ── Poster + Info row ── */}
      <div className="flex gap-5 sm:gap-8 mt-6">
        {/* Poster */}
        <div className="shrink-0 relative w-[100px] h-[150px] sm:w-[140px] sm:h-[210px] rounded-lg overflow-hidden border border-white/[0.06]">
          <Image
            src={getImageUrl(posterPath, "w342")}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-1">
          <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-tight">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[12px] sm:text-[13px] text-[--muted]">
            {year && <span>{year}</span>}
            {runtime > 0 && (
              <>
                <span className="text-white/10">·</span>
                <span>{Math.floor(runtime / 60)}h {runtime % 60}m</span>
              </>
            )}
            {directorName && (
              <>
                <span className="text-white/10">·</span>
                <span>Dir. <span className="text-white/70">{directorName}</span></span>
              </>
            )}
            {voteAverage > 0 && (
              <>
                <span className="text-white/10">·</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" weight="fill" />
                  <span className="text-amber-300/80">{voteAverage.toFixed(1)}</span>
                </span>
              </>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-[12px] sm:text-[13px] text-white/30">
              {genres.map((g, i) => (
                <span key={g.id} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  <span>{g.name}</span>
                </span>
              ))}
            </div>
          )}

          {/* Overview — desktop */}
          {overview && (
            <p className="hidden sm:block text-white/45 text-[14px] leading-[1.7] mt-3 max-w-xl line-clamp-3">
              {overview}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            {trailerKey && (
              <button onClick={() => setShowTrailer(true)} className="btn-secondary">
                <Play className="w-4 h-4" />
                Trailer
              </button>
            )}
            <WatchlistButton id={id} title={title} posterPath={posterPath} mediaType="movie" voteAverage={voteAverage} />
          </div>
        </div>
      </div>

      {/* ── Mobile overview ── */}
      {overview && (
        <p className="sm:hidden text-white/40 text-[13px] leading-[1.7] mt-4">
          {overview}
        </p>
      )}

      {showTrailer && trailerKey && (
        <TrailerModal youtubeKey={trailerKey} title={title} onClose={() => setShowTrailer(false)} />
      )}
    </>
  );
}
