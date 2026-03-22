import Image from "next/image";
import Link from "next/link";
import { Star } from "@/components/icons";
import { getImageUrl, getBlurDataUrl } from "@/lib/tmdb";
import WatchlistButton from "./WatchlistButton";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  mediaType?: "movie" | "tv";
}

export default function MovieCard({
  id,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  mediaType = "movie",
}: MovieCardProps) {
  const href = mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <Link
      href={href}
      className="group relative flex-shrink-0 w-[130px] sm:w-[150px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] rounded-lg"
      aria-label={`${title}${year ? ` (${year})` : ""} — Rating: ${(voteAverage ?? 0).toFixed(1)}`}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.03] transition-all group-hover:ring-2 group-hover:ring-white/20">
        <Image
          src={getImageUrl(posterPath, "w342")}
          alt=""
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL={getBlurDataUrl()}
          className="object-cover"
          sizes="150px"
        />
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <WatchlistButton
            id={id}
            title={title}
            posterPath={posterPath}
            mediaType={mediaType}
            voteAverage={voteAverage}
            size="sm"
          />
        </div>
      </div>
      <div className="mt-1.5">
        <p className="text-white/70 text-[12px] font-medium line-clamp-1 group-hover:text-white transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Star className="w-3 h-3 text-amber-400" weight="fill" />
          <span className="text-[--muted] text-[11px]">{(voteAverage ?? 0).toFixed(1)}</span>
          {year && <span className="text-[--muted-dark] text-[11px]">· {year}</span>}
        </div>
      </div>
    </Link>
  );
}
