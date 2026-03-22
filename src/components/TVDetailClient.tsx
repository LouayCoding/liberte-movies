"use client";

import { useState, useEffect } from "react";
import { Play } from "@/components/icons";
import WatchlistButton from "./WatchlistButton";
import TrailerModal from "./TrailerModal";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface TVDetailClientProps {
  id: number;
  name: string;
  posterPath: string | null;
  voteAverage: number;
  trailerKey: string | null;
  tvId: string;
}

export default function TVDetailClient({
  id,
  name,
  posterPath,
  voteAverage,
  trailerKey,
  tvId,
}: TVDetailClientProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const { addToRecent } = useRecentlyViewed();

  useEffect(() => {
    addToRecent({ id, title: name, posterPath, mediaType: "tv", voteAverage });
  }, [id, name, posterPath, voteAverage, addToRecent]);

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <a
          href={`/watch/tv/${tvId}?season=1&episode=1`}
          className="btn-primary"
        >
          <Play className="w-4 h-4" weight="fill" />
          Watch S1 E1
        </a>
        {trailerKey && (
          <button
            onClick={() => setShowTrailer(true)}
            className="btn-secondary"
          >
            <Play className="w-4 h-4" />
            Trailer
          </button>
        )}
        <WatchlistButton
          id={id}
          title={name}
          posterPath={posterPath}
          mediaType="tv"
          voteAverage={voteAverage}
        />
      </div>

      {showTrailer && trailerKey && (
        <TrailerModal
          youtubeKey={trailerKey}
          title={name}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </>
  );
}
