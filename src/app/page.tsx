import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getPopularTV,
  getTopRatedTV,
} from "@/lib/tmdb";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import RecentlyViewedRow from "@/components/RecentlyViewedRow";

export default async function Home() {
  const [trending, popular, topRated, nowPlaying, popularTV, topRatedTV] =
    await Promise.all([
      getTrending("all", "week"),
      getPopularMovies(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getPopularTV(),
      getTopRatedTV(),
    ]);

  const heroItems = trending.results.slice(0, 6).map((item) => ({
    id: item.id,
    title: item.title || item.name,
    overview: item.overview,
    backdropPath: item.backdrop_path,
    voteAverage: item.vote_average,
    mediaType: (item.media_type as "movie" | "tv") || "movie",
  }));

  return (
    <div>
      <HeroBanner items={heroItems} />

      <div className="relative -mt-24 z-10 flex flex-col gap-10 pb-8">
        <RecentlyViewedRow />
        <MovieRow title="Trending This Week" movies={trending.results} />
        <MovieRow title="Now Playing" movies={nowPlaying.results} mediaType="movie" seeAllHref="/movies" />
        <MovieRow title="Popular Movies" movies={popular.results} mediaType="movie" seeAllHref="/movies" />
        <MovieRow title="Top Rated Movies" movies={topRated.results} mediaType="movie" seeAllHref="/movies" />
        <MovieRow title="Popular TV Shows" movies={popularTV.results} mediaType="tv" seeAllHref="/tv" />
        <MovieRow title="Top Rated TV Shows" movies={topRatedTV.results} mediaType="tv" seeAllHref="/tv" />
      </div>
    </div>
  );
}
