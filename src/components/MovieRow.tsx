"use client";

import { CaretLeft, CaretRight } from "@/components/icons";
import { useRef, useState } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
  mediaType?: "movie" | "tv";
  seeAllHref?: string;
}

export default function MovieRow({ title, movies, mediaType, seeAllHref }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 20);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  return (
    <section className="relative group/row">
      <div className="flex items-center justify-between px-4 sm:px-6 mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs text-[--muted] hover:text-[--accent] transition-colors font-medium"
          >
            See All
          </Link>
        )}
      </div>
      <div className="relative">
        {/* Left Arrow */}
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-0 bottom-12 z-10 w-14 bg-gradient-to-r from-[--background] via-[--background]/60 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <CaretLeft className="w-4 h-4 text-white" weight="bold" />
            </div>
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-2"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title || movie.name || "Unknown"}
              posterPath={movie.poster_path}
              voteAverage={movie.vote_average}
              releaseDate={movie.release_date || movie.first_air_date}
              mediaType={mediaType || (movie.media_type as "movie" | "tv") || "movie"}
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-0 bottom-12 z-10 w-14 bg-gradient-to-l from-[--background] via-[--background]/60 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <CaretRight className="w-4 h-4 text-white" weight="bold" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
