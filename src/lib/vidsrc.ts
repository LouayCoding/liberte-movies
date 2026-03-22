const VIDKING_BASE = "https://www.vidking.net/embed";
const PLAYER_COLOR = "5865f2";

export function getMovieEmbedUrl(id: string): string {
  return `${VIDKING_BASE}/movie/${id}?color=${PLAYER_COLOR}&autoPlay=true`;
}

export function getTVEmbedUrl(id: string, season: number, episode: number): string {
  return `${VIDKING_BASE}/tv/${id}/${season}/${episode}?color=${PLAYER_COLOR}&autoPlay=true&nextEpisode=true&episodeSelector=true`;
}
