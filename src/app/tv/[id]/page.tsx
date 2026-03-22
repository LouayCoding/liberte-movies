import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, CalendarBlank, ArrowLeft, Television } from "@/components/icons";
import { getTVDetails, getImageUrl, getBackdropUrl } from "@/lib/tmdb";
import MovieRow from "@/components/MovieRow";
import TVDetailClient from "@/components/TVDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getTVDetails(id);
  return {
    title: `${show.name} (${show.first_air_date ? new Date(show.first_air_date).getFullYear() : ""}) — Liberté`,
    description: show.overview?.slice(0, 160),
    openGraph: {
      title: show.name,
      description: show.overview?.slice(0, 160),
      images: show.backdrop_path
        ? [{ url: getBackdropUrl(show.backdrop_path) || "", width: 1280, height: 720 }]
        : [],
    },
  };
}

export default async function TVDetailPage({ params }: PageProps) {
  const { id } = await params;
  const show = await getTVDetails(id);

  const cast = show.credits?.cast?.slice(0, 12) || [];
  const trailer = show.videos?.results?.find(
    (v: { type: string; site: string }) =>
      v.type === "Trailer" && v.site === "YouTube"
  );
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null;

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <div className="relative w-full h-[30vh] sm:h-[40vh] overflow-hidden">
        {show.backdrop_path ? (
          <Image
            src={getBackdropUrl(show.backdrop_path)!}
            alt=""
            fill
            className="object-cover hidden sm:block"
            priority
            sizes="100vw"
          />
        ) : null}
        <Image
          src={getImageUrl(show.poster_path, "w780")}
          alt=""
          fill
          className="object-cover sm:hidden scale-110 blur-xl"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[--background] via-[--background]/60 to-[--background]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[--background]/80 via-[--background]/30 to-transparent hidden sm:block" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[--background] to-transparent" />

        <Link
          href="/"
          className="absolute top-20 left-4 sm:left-6 flex items-center gap-2 text-white/70 hover:text-white transition-all bg-black/30 backdrop-blur-md px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-black/40 z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Mobile layout */}
        <div className="flex flex-col sm:hidden -mt-28 mb-6">
          <div className="flex gap-4">
            <Image
              src={getImageUrl(show.poster_path, "w342")}
              alt={show.name}
              width={120}
              height={180}
              className="rounded-xl border border-white/[0.08] shadow-2xl shrink-0"
              priority
            />
            <div className="pt-8 min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight mb-1.5">
                {show.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {show.vote_average > 0 && (
                  <span className="flex items-center gap-1 bg-amber-400/15 text-amber-300 font-semibold px-2 py-1 rounded-md">
                    <Star className="w-3 h-3 text-amber-400" weight="fill" />
                    {(show.vote_average ?? 0).toFixed(1)}
                  </span>
                )}
                {year && <span className="text-[--muted]">{year}</span>}
                <span className="text-[--muted]">{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex gap-10 -mt-20 mb-8">
          <div className="shrink-0">
            <Image
              src={getImageUrl(show.poster_path, "w500")}
              alt={show.name}
              width={240}
              height={360}
              className="rounded-2xl border border-white/[0.08] shadow-2xl"
              priority
            />
          </div>
          <div className="flex-1 pt-6 min-w-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight leading-tight">
              {show.name}
              {year && <span className="text-[--muted] font-normal text-2xl ml-3">({year})</span>}
            </h1>

            {show.tagline && (
              <p className="text-[--muted] italic text-sm mb-4">{show.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {show.vote_average > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-400/15 px-2.5 py-1.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-400" weight="fill" />
                  <span className="text-amber-300 text-sm font-semibold">
                    {(show.vote_average ?? 0).toFixed(1)}
                  </span>
                </div>
              )}
              <span className="flex items-center gap-1.5 text-[--muted] text-sm">
                <Television className="w-4 h-4" />
                {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
              </span>
            </div>

            {show.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {show.genres.map((genre: { id: number; name: string }) => (
                  <span key={genre.id} className="chip text-xs">{genre.name}</span>
                ))}
              </div>
            )}

            {show.overview && (
              <p className="text-white/60 text-[15px] leading-relaxed mb-6 max-w-2xl">
                {show.overview}
              </p>
            )}

            <TVDetailClient
              id={show.id}
              name={show.name}
              posterPath={show.poster_path}
              voteAverage={show.vote_average}
              trailerKey={trailer?.key || null}
              tvId={id}
            />
          </div>
        </div>

        {/* Mobile-only: genres, overview, actions */}
        <div className="sm:hidden space-y-4 mb-8">
          {show.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {show.genres.map((genre: { id: number; name: string }) => (
                <span key={genre.id} className="chip text-xs">{genre.name}</span>
              ))}
            </div>
          )}

          {show.overview && (
            <p className="text-white/55 text-sm leading-relaxed">
              {show.overview}
            </p>
          )}

          <TVDetailClient
            id={show.id}
            name={show.name}
            posterPath={show.poster_path}
            voteAverage={show.vote_average}
            trailerKey={trailer?.key || null}
            tvId={id}
          />
        </div>

        {/* ===== SEASONS ===== */}
        {show.seasons?.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-semibold text-white mb-3 tracking-tight">Seasons</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {show.seasons
                .filter((s: { season_number: number }) => s.season_number > 0)
                .map(
                  (season: {
                    id: number;
                    season_number: number;
                    name: string;
                    poster_path: string | null;
                    episode_count: number;
                  }) => (
                    <Link
                      key={season.id}
                      href={`/watch/tv/${id}?season=${season.season_number}&episode=1`}
                      className="shrink-0 w-[130px] group"
                    >
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12] mb-2 transition-all duration-300">
                        <Image
                          src={getImageUrl(season.poster_path, "w342")}
                          alt={season.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          sizes="130px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white ml-0.5" weight="fill" />
                          </div>
                        </div>
                      </div>
                      <p className="text-white/80 text-xs font-medium line-clamp-1">{season.name}</p>
                      <p className="text-[--muted-dark] text-[11px]">{season.episode_count} Episodes</p>
                    </Link>
                  )
                )}
            </div>
          </section>
        )}

        {/* ===== CAST ===== */}
        {cast.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-semibold text-white mb-3 tracking-tight">Cast</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {cast.map(
                (actor: {
                  id: number;
                  name: string;
                  character: string;
                  profile_path: string | null;
                }) => (
                  <Link key={actor.id} href={`/person/${actor.id}`} className="shrink-0 w-[100px] text-center group">
                    <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden bg-white/[0.04] border border-white/[0.06] mb-2 mx-auto">
                      <Image
                        src={getImageUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="100px"
                      />
                    </div>
                    <p className="text-white/90 text-[11px] font-medium line-clamp-1 group-hover:text-[--accent] transition-colors">
                      {actor.name}
                    </p>
                    <p className="text-[--muted-dark] text-[10px] line-clamp-1">
                      {actor.character}
                    </p>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        {/* ===== SIMILAR ===== */}
        {(show.similar?.results?.length ?? 0) > 0 && (
          <div className="mb-10">
            <MovieRow
              title="Similar Shows"
              movies={show.similar!.results}
              mediaType="tv"
            />
          </div>
        )}
      </div>
    </div>
  );
}
