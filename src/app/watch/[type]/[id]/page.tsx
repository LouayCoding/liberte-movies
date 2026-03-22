"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CaretDown, CaretUp, Monitor, Play, Star } from "@/components/icons";
import { getMovieEmbedUrl, getTVEmbedUrl } from "@/lib/vidsrc";
import { getImageUrl } from "@/lib/tmdb";

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
  air_date: string;
  runtime: number | null;
}

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = params.type as string;
  const id = params.id as string;

  const [season, setSeason] = useState(Number(searchParams.get("season")) || 1);
  const [episode, setEpisode] = useState(Number(searchParams.get("episode")) || 1);
  const [showControls, setShowControls] = useState(true);
  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const [adShieldClicks, setAdShieldClicks] = useState(0);
  const adShieldMax = 3;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl =
    type === "tv"
      ? getTVEmbedUrl(id, season, episode)
      : getMovieEmbedUrl(id);

  const currentEp = episodes.find((ep) => ep.episode_number === episode);

  const handleShieldClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdShieldClicks((prev) => prev + 1);
  }, []);

  // Reset shield when changing content
  useEffect(() => {
    setAdShieldClicks(0);
  }, [id, season, episode]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

    if (type === "movie") {
      fetch(`${baseUrl}/movie/${id}?api_key=${apiKey}`)
        .then((r) => r.json())
        .then((d) => { setTitle(d.title || "Movie"); setPosterPath(d.poster_path); })
        .catch(() => {});
    } else {
      fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}`)
        .then((r) => r.json())
        .then((d) => {
          setTitle(d.name || "TV Show");
          setTotalSeasons(d.number_of_seasons || 1);
          setPosterPath(d.poster_path);
        })
        .catch(() => {});
    }
  }, [id, type]);

  useEffect(() => {
    if (type !== "tv") return;
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

    fetch(`${baseUrl}/tv/${id}/season/${season}?api_key=${apiKey}`)
      .then((r) => r.json())
      .then((d) => setEpisodes(d.episodes || []))
      .catch(() => {});
  }, [id, type, season]);

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link
            href={type === "tv" ? `/tv/${id}` : `/movie/${id}`}
            className="flex items-center gap-2 text-[--muted] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-white/10">|</span>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-[--accent]" />
            <span className="text-white text-sm font-medium">
              {title}
              {type === "tv" && ` — S${season} E${episode}`}
            </span>
          </div>
        </div>
        {type === "tv" && (
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center gap-1 text-[--muted] hover:text-white text-sm transition-colors"
          >
            Episodes
            {showControls ? (
              <CaretUp className="w-4 h-4" />
            ) : (
              <CaretDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Player */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="origin"
        />
        {/* Ad Click Shield - absorbs first clicks that trigger ads */}
        {adShieldClicks < adShieldMax && (
          <div
            onClick={handleShieldClick}
            className="absolute inset-0 z-10 cursor-pointer"
          >
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-xl backdrop-blur-md pointer-events-none border border-white/10">
              Click {adShieldMax - adShieldClicks}x to bypass ads, then enjoy
            </div>
          </div>
        )}
      </div>

      {/* Now Playing Info */}
      {type === "tv" && currentEp && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-white font-semibold text-lg tracking-tight">
            S{season} E{episode}: {currentEp.name}
          </h3>
          {currentEp.overview && (
            <p className="text-white/50 text-sm mt-1 line-clamp-2 max-w-3xl">
              {currentEp.overview}
            </p>
          )}
        </div>
      )}

      {/* TV Controls */}
      {type === "tv" && showControls && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          {/* Season Selector */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeason(s);
                  setEpisode(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  season === s
                    ? "bg-[--accent] text-white"
                    : "chip"
                }`}
              >
                Season {s}
              </button>
            ))}
          </div>

          {/* Episode List with Thumbnails */}
          <div className="space-y-2">
            {episodes.map((ep) => (
              <button
                key={ep.episode_number}
                onClick={() => setEpisode(ep.episode_number)}
                className={`w-full flex gap-4 p-3 rounded-xl text-left transition-all duration-200 ${
                  episode === ep.episode_number
                    ? "bg-[--accent-soft] border border-[--accent]/30"
                    : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative shrink-0 w-[160px] aspect-video rounded-xl overflow-hidden bg-white/[0.03]">
                  {ep.still_path ? (
                    <Image
                      src={getImageUrl(ep.still_path, "w300")}
                      alt={ep.name}
                      fill
                      loading="lazy"
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : posterPath ? (
                    <Image
                      src={getImageUrl(posterPath, "w300")}
                      alt={ep.name}
                      fill
                      loading="lazy"
                      className="object-cover opacity-40"
                      sizes="160px"
                    />
                  ) : null}
                  {episode === ep.episode_number && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-8 h-8 rounded-full bg-[--accent] flex items-center justify-center">
                        <Play className="w-4 h-4 text-white ml-0.5" weight="fill" />
                      </div>
                    </div>
                  )}
                  {ep.runtime && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {ep.runtime}m
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${
                      episode === ep.episode_number ? "text-[--accent]" : "text-[--muted-dark]"
                    }`}>
                      E{ep.episode_number}
                    </span>
                    <span className={`text-sm font-medium line-clamp-1 ${
                      episode === ep.episode_number ? "text-white" : "text-white/80"
                    }`}>
                      {ep.name}
                    </span>
                  </div>
                  {ep.overview && (
                    <p className="text-[--muted-dark] text-xs line-clamp-2 leading-relaxed">
                      {ep.overview}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {ep.vote_average > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" weight="fill" />
                        <span className="text-[--muted] text-xs">{ep.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                    {ep.air_date && (
                      <span className="text-[--muted-dark] text-xs">
                        {new Date(ep.air_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[--accent] border-t-transparent rounded-full" />
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}
