import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { getMovieDetails, getImageUrl, getBackdropUrl } from "@/lib/tmdb";
import MovieRow from "@/components/MovieRow";
import MovieDetailClient from "@/components/MovieDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  return {
    title: `${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : ""}) — Liberté`,
    description: movie.overview?.slice(0, 160),
    openGraph: {
      title: movie.title,
      description: movie.overview?.slice(0, 160),
      images: movie.backdrop_path
        ? [{ url: getBackdropUrl(movie.backdrop_path) || "", width: 1280, height: 720 }]
        : [],
    },
  };
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  const director = movie.credits?.crew?.find(
    (c: { job: string }) => c.job === "Director"
  );
  const cast = movie.credits?.cast?.slice(0, 12) || [];
  const trailer = movie.videos?.results?.find(
    (v: { type: string; site: string }) =>
      v.type === "Trailer" && v.site === "YouTube"
  );
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  return (
    <div className="min-h-screen">
      {/* ── Backdrop ── */}
      <div className="relative w-full h-[40vh] sm:h-[50vh]">
        {movie.backdrop_path && (
          <Image
            src={getBackdropUrl(movie.backdrop_path)!}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[--background] via-[--background]/50 to-[--background]/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-[--background]/60 to-transparent hidden sm:block" />

        <Link
          href="/"
          className="absolute top-20 left-5 sm:left-8 flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-[1100px] mx-auto px-5 sm:px-8">
        {/* Poster + Info + Player — all handled by client component */}
        <MovieDetailClient
          id={movie.id}
          title={movie.title}
          posterPath={movie.poster_path}
          voteAverage={movie.vote_average}
          trailerKey={trailer?.key || null}
          movieId={id}
          year={year}
          runtime={movie.runtime || 0}
          directorName={director?.name || null}
          tagline={movie.tagline || null}
          overview={movie.overview || null}
          genres={movie.genres || []}
        />

        {/* ── Cast ── */}
        {cast.length > 0 && (
          <section className="mt-14 sm:mt-16">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[--muted-dark] mb-4">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {cast.map(
                (actor: {
                  id: number;
                  name: string;
                  character: string;
                  profile_path: string | null;
                }) => (
                  <Link
                    key={actor.id}
                    href={`/person/${actor.id}`}
                    className="shrink-0 w-[72px] text-center group"
                  >
                    <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.05] mb-2">
                      <Image
                        src={getImageUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="72px"
                      />
                    </div>
                    <p className="text-white/60 text-[11px] font-medium line-clamp-1 group-hover:text-white transition-colors">
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

        {/* ── Similar ── */}
        {(movie.similar?.results?.length ?? 0) > 0 && (
          <section className="mt-14 sm:mt-16">
            <MovieRow
              title="Similar Movies"
              movies={movie.similar!.results}
              mediaType="movie"
            />
          </section>
        )}

        {/* ── Recommendations ── */}
        {(movie.recommendations?.results?.length ?? 0) > 0 && (
          <section className="mt-14 sm:mt-16 pb-12">
            <MovieRow
              title="Recommended For You"
              movies={movie.recommendations!.results}
              mediaType="movie"
            />
          </section>
        )}
      </div>
    </div>
  );
}
