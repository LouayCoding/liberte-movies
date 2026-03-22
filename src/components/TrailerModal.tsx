"use client";

import { X } from "@/components/icons";
import { useEffect } from "react";

interface TrailerModalProps {
  youtubeKey: string;
  title: string;
  onClose: () => void;
}

export default function TrailerModal({ youtubeKey, title, onClose }: TrailerModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close trailer"
          className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-white/80 text-sm font-medium mb-3">{title} — Trailer</p>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.06]">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            title={`${title} Trailer`}
          />
        </div>
      </div>
    </div>
  );
}
