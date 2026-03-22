"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import MovieCard from "./MovieCard";

export default function RecentlyViewedRow() {
  const { recentlyViewed, mounted } = useRecentlyViewed();

  if (!mounted || recentlyViewed.length === 0) return null;

  return (
    <section className="relative">
      <h2 className="text-base sm:text-lg font-semibold text-white mb-4 px-4 sm:px-6 tracking-tight">
        Continue Watching
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-2">
        {recentlyViewed.map((item) => (
          <MovieCard
            key={`${item.mediaType}-${item.id}`}
            id={item.id}
            title={item.title}
            posterPath={item.posterPath}
            voteAverage={item.voteAverage}
            mediaType={item.mediaType}
          />
        ))}
      </div>
    </section>
  );
}
