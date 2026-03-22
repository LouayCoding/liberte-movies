"use client";

import { Heart } from "@/components/icons";
import { useWatchlist } from "@/hooks/useWatchlist";

interface WatchlistButtonProps {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  voteAverage: number;
  size?: "sm" | "md";
}

export default function WatchlistButton({
  id,
  title,
  posterPath,
  mediaType,
  voteAverage,
  size = "md",
}: WatchlistButtonProps) {
  const { isInWatchlist, toggleWatchlist, mounted } = useWatchlist();
  const active = mounted && isInWatchlist(id, mediaType);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({ id, title, posterPath, mediaType, voteAverage });
  };

  const sizeClasses = size === "sm"
    ? "w-8 h-8"
    : "w-10 h-10";

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-200 ${
        active
          ? "bg-[--accent] text-white hover:bg-[--accent-hover]"
          : "bg-black/40 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/60 border border-white/15"
      }`}
    >
      <Heart className={iconSize} weight={active ? "fill" : "regular"} />
    </button>
  );
}
