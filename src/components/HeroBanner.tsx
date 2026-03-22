"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "@/components/icons";
import { getBackdropUrl } from "@/lib/tmdb";

interface HeroItem {
  id: number;
  title: string;
  overview: string;
  backdropPath: string | null;
  voteAverage: number;
  mediaType: "movie" | "tv";
}

interface HeroBannerProps {
  items: HeroItem[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const safeItems = items.filter((i) => i.id && i.title);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current || safeItems.length === 0) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [current, isTransitioning, safeItems.length]
  );

  useEffect(() => {
    if (safeItems.length <= 1) return;
    const interval = setInterval(() => {
      goTo((current + 1) % safeItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [current, safeItems.length, goTo]);

  if (safeItems.length === 0) return null;

  const item = safeItems[current] || safeItems[0];
  const detailHref = item.mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
  const watchHref = item.mediaType === "tv" ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`;

  return (
    <div className="relative w-full h-[65vh] sm:h-[80vh] overflow-hidden">
      {/* Backdrop Images */}
      {safeItems.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.backdropPath ? (
            <Image
              src={getBackdropUrl(slide.backdropPath)!}
              alt={slide.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[--accent]/20 via-[--background] to-[--background]" />
          )}
        </div>
      ))}

      {/* Gradient Overlays - softer */}
      <div className="absolute inset-0 bg-gradient-to-t from-[--background] via-[--background]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[--background]/80 via-[--background]/20 to-transparent" />

      {/* Content */}
      <div
        key={item.id}
        className="absolute bottom-0 left-0 right-0 p-5 pb-28 sm:p-10 sm:pb-36 max-w-3xl animate-fade-in"
      >
        <h1 className="text-2xl sm:text-5xl font-bold text-white mb-3 leading-tight tracking-tight">
          {item.title}
        </h1>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center gap-1.5 bg-amber-400/15 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 text-amber-400" weight="fill" />
            <span className="text-amber-300 text-sm font-semibold">
              {(item.voteAverage ?? 0).toFixed(1)}
            </span>
          </div>
          <span className="text-[--muted] text-xs uppercase tracking-widest font-medium">
            {item.mediaType === "tv" ? "TV Series" : "Movie"}
          </span>
        </div>

        {item.overview && (
          <p className="text-white/70 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed max-w-xl">
            {item.overview}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Link
            href={watchHref}
            className="btn-primary"
          >
            <Play className="w-4 h-4" weight="fill" />
            Watch Now
          </Link>
          <Link
            href={detailHref}
            className="btn-secondary"
          >
            <Info className="w-4 h-4" />
            More Info
          </Link>
        </div>
      </div>

      {/* Dots */}
      {safeItems.length > 1 && (
      <div className="absolute bottom-6 sm:bottom-10 right-5 sm:right-10 flex items-center gap-2 z-20">
        {safeItems.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-400 rounded-full ${
              i === current
                ? "w-7 h-2 bg-[--accent]"
                : "w-2 h-2 bg-white/25 hover:bg-white/45"
            }`}
          />
        ))}
      </div>
      )}

      {/* Progress bar */}
      {safeItems.length > 1 && (
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06] z-20">
        <div
          className="h-full bg-[--accent]/70 rounded-full"
          style={{
            width: `${((current + 1) / safeItems.length) * 100}%`,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
      )}
    </div>
  );
}
