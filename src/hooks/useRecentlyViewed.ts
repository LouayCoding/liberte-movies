"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentItem {
  id: number;
  title: string;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  voteAverage: number;
  viewedAt: number;
}

const STORAGE_KEY = "moviehub_recently_viewed";
const MAX_ITEMS = 20;

function getStored(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getStored());
    setMounted(true);
  }, []);

  const addToRecent = useCallback((item: Omit<RecentItem, "viewedAt">) => {
    const current = getStored().filter(
      (i) => !(i.id === item.id && i.mediaType === item.mediaType)
    );
    const updated = [{ ...item, viewedAt: Date.now() }, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setItems(updated);
  }, []);

  return { recentlyViewed: items, addToRecent, mounted };
}
