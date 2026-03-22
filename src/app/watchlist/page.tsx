"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Trash, HeartBreak } from "@/components/icons";
import { getImageUrl } from "@/lib/tmdb";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, mounted } = useWatchlist();

  if (!mounted) {
    return (
      <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="h-9 w-40 bg-white/[0.04] rounded-xl mb-2 animate-pulse" />
        <div className="h-5 w-56 bg-white/[0.03] rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] bg-white/[0.04] rounded-xl animate-pulse" />
              <div className="mt-2.5 h-4 w-3/4 bg-white/[0.03] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-7 h-7 text-[--accent]" weight="fill" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Watchlist</h1>
      </div>
      <p className="text-[--muted] mb-8 text-sm">
        {watchlist.length} {watchlist.length === 1 ? "item" : "items"} saved
      </p>

      {watchlist.length === 0 ? (
        <div className="text-center py-20">
          <HeartBreak className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-[--muted] text-lg mb-2">Your watchlist is empty</p>
          <p className="text-[--muted-dark] text-sm mb-6">
            Browse movies and TV shows and tap the heart icon to save them here.
          </p>
          <Link
            href="/"
            className="btn-primary"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {watchlist.map((item) => {
            const href = item.mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
            return (
              <div key={`${item.mediaType}-${item.id}`} className="group relative">
                <Link href={href}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12] mb-2 transition-all duration-300">
                    <Image
                      src={getImageUrl(item.posterPath, "w342")}
                      alt={item.title}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="200px"
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm ${
                          item.mediaType === "tv" ? "bg-blue-500/80" : "bg-[--accent]/80"
                        }`}
                      >
                        {item.mediaType === "tv" ? "TV" : "MOVIE"}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80 text-[13px] font-medium line-clamp-1 group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3 h-3 text-amber-400" weight="fill" />
                    <span className="text-[--muted] text-xs">
                      {(item.voteAverage ?? 0).toFixed(1)}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => removeFromWatchlist(item.id, item.mediaType)}
                  aria-label={`Remove ${item.title} from watchlist`}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-[--accent] hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
