"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, CalendarBlank, MapPin, FilmSlate, Television } from "@/components/icons";
import { getImageUrl } from "@/lib/tmdb";

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  combined_credits: {
    cast: CreditItem[];
  };
}

interface CreditItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  character?: string;
  popularity: number;
}

export default function PersonPage() {
  const params = useParams();
  const id = params.id as string;
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

    fetch(`${baseUrl}/person/${id}?api_key=${apiKey}&language=en-US&append_to_response=combined_credits`)
      .then((r) => r.json())
      .then((data) => {
        setPerson(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0 w-[220px] h-[330px] bg-white/[0.04] rounded-2xl animate-pulse" />
          <div className="flex-1 space-y-4">
            <div className="h-10 w-64 bg-white/[0.04] rounded-xl animate-pulse" />
            <div className="h-5 w-40 bg-white/[0.03] rounded-lg animate-pulse" />
            <div className="space-y-2 max-w-2xl">
              <div className="h-4 w-full bg-white/[0.04] rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-white/[0.04] rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-white/[0.03] rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
        <p className="text-[--muted]">Person not found.</p>
      </div>
    );
  }

  const credits = person.combined_credits?.cast
    ?.filter((c) => c.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i) || [];

  const movieCredits = credits.filter((c) => c.media_type === "movie");
  const tvCredits = credits.filter((c) => c.media_type === "tv");

  const age = person.birthday
    ? Math.floor(
        (Date.now() - new Date(person.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[--muted] hover:text-white transition-colors text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Profile Image */}
        <div className="shrink-0">
          <div className="relative w-[220px] h-[330px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
            <Image
              src={getImageUrl(person.profile_path, "w500")}
              alt={person.name}
              fill
              className="object-cover"
              sizes="220px"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 tracking-tight">{person.name}</h1>
          <p className="text-[--muted] text-sm mb-4">{person.known_for_department}</p>

          <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-[--muted]">
            {person.birthday && (
              <div className="flex items-center gap-1.5">
                <CalendarBlank className="w-4 h-4" />
                {new Date(person.birthday).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {age && !person.deathday && (
                  <span className="text-[--muted-dark]">({age} years old)</span>
                )}
              </div>
            )}
            {person.deathday && (
              <div className="flex items-center gap-1.5 text-[--muted-dark]">
                † {new Date(person.deathday).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
            {person.place_of_birth && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {person.place_of_birth}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-5 text-sm">
            <div className="flex items-center gap-1.5 text-white/70">
              <FilmSlate className="w-4 h-4 text-[--accent]" />
              {movieCredits.length} Movies
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Television className="w-4 h-4 text-blue-400" />
              {tvCredits.length} TV Shows
            </div>
          </div>

          {person.biography && (
            <div className="max-w-2xl">
              <p
                className={`text-white/65 text-sm leading-relaxed ${
                  !showFullBio ? "line-clamp-5" : ""
                }`}
              >
                {person.biography}
              </p>
              {person.biography.length > 300 && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-[--accent] hover:text-[--accent-hover] text-sm mt-2 font-medium"
                >
                  {showFullBio ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Known For - Movies */}
      {movieCredits.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
            <FilmSlate className="w-5 h-5 text-[--accent]" />
            Movies
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {movieCredits.slice(0, 24).map((credit) => (
              <Link key={`movie-${credit.id}`} href={`/movie/${credit.id}`} className="group">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12] mb-1.5 transition-all duration-300">
                  <Image
                    src={getImageUrl(credit.poster_path, "w342")}
                    alt={credit.title || ""}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="150px"
                  />
                </div>
                <p className="text-white/80 text-xs font-medium line-clamp-1 group-hover:text-white transition-colors">
                  {credit.title}
                </p>
                {credit.character && (
                  <p className="text-[--muted-dark] text-xs line-clamp-1">{credit.character}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Known For - TV */}
      {tvCredits.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
            <Television className="w-5 h-5 text-blue-400" />
            TV Shows
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {tvCredits.slice(0, 24).map((credit) => (
              <Link key={`tv-${credit.id}`} href={`/tv/${credit.id}`} className="group">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12] mb-1.5 transition-all duration-300">
                  <Image
                    src={getImageUrl(credit.poster_path, "w342")}
                    alt={credit.name || ""}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="150px"
                  />
                </div>
                <p className="text-white/80 text-xs font-medium line-clamp-1 group-hover:text-white transition-colors">
                  {credit.name}
                </p>
                {credit.character && (
                  <p className="text-[--muted-dark] text-xs line-clamp-1">{credit.character}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
