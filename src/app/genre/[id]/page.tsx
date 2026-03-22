"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowLeft } from "@/components/icons";
import { getImageUrl } from "@/lib/tmdb";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

function GenreContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const genreId = params.id as string;
  const genreName = searchParams.get("name") || "Genre";
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

    fetch(
      `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US`
    )
      .then((r) => r.json())
      .then((d) => {
        setMovies(d.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [genreId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[--accent] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6">
      <Link
        href="/movies"
        className="flex items-center gap-2 text-[--muted] hover:text-white transition-colors text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All Movies
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{genreName}</h1>
      <p className="text-[--muted] mb-8 text-sm">{movies.length} movies found</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12] mb-2 transition-all duration-300">
              <Image
                src={getImageUrl(movie.poster_path, "w342")}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="200px"
              />
            </div>
            <p className="text-white/80 text-[13px] font-medium line-clamp-1 group-hover:text-white transition-colors">
              {movie.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3 h-3 text-amber-400" weight="fill" />
              <span className="text-[--muted] text-xs">
                {(movie.vote_average ?? 0).toFixed(1)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function GenrePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[--accent] border-t-transparent rounded-full" />
        </div>
      }
    >
      <GenreContent />
    </Suspense>
  );
}
