"use client";

import { useState, useEffect, useCallback } from "react";

export interface WatchlistItem {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  voteAverage: number;
  addedAt: number;
}

const STORAGE_KEY = "moviehub_watchlist";

function getStoredWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWatchlist(getStoredWatchlist());
    setMounted(true);
  }, []);

  const save = useCallback((items: WatchlistItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setWatchlist(items);
  }, []);

  const addToWatchlist = useCallback(
    (item: Omit<WatchlistItem, "addedAt">) => {
      const current = getStoredWatchlist();
      if (current.some((i) => i.id === item.id && i.mediaType === item.mediaType)) return;
      save([{ ...item, addedAt: Date.now() }, ...current]);
    },
    [save]
  );

  const removeFromWatchlist = useCallback(
    (id: number, mediaType: "movie" | "tv") => {
      const current = getStoredWatchlist();
      save(current.filter((i) => !(i.id === id && i.mediaType === mediaType)));
    },
    [save]
  );

  const isInWatchlist = useCallback(
    (id: number, mediaType: "movie" | "tv") => {
      return watchlist.some((i) => i.id === id && i.mediaType === mediaType);
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (item: Omit<WatchlistItem, "addedAt">) => {
      if (isInWatchlist(item.id, item.mediaType)) {
        removeFromWatchlist(item.id, item.mediaType);
      } else {
        addToWatchlist(item);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist, mounted };
}
