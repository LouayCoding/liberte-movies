export const env = {
  get TMDB_API_KEY() {
    return process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
  },
  get TMDB_BASE_URL() {
    return process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
  },
  get TMDB_IMAGE_BASE() {
    return process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";
  },
} as const;
