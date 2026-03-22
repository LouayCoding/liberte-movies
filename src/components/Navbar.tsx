"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, FilmSlate, Television, House, X, Heart, BookOpen } from "@/components/icons";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: House },
    { href: "/movies", label: "Movies", icon: FilmSlate },
    { href: "/tv", label: "TV Shows", icon: Television },
    { href: "/manga", label: "Manga", icon: BookOpen },
    { href: "/watchlist", label: "Watchlist", icon: Heart },
  ];

  const isWatchPage = pathname.startsWith("/watch");

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[--background]/80 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-gradient-to-b from-[--background]/90 to-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <span className="text-xl font-bold text-white tracking-tight">
                Liber<span className="text-[--accent]">té</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? "text-white bg-white/[0.08]"
                      : "text-[--muted] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <link.icon className="w-4 h-4" weight={pathname === link.href ? "fill" : "regular"} />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies & TV..."
                    className="bg-white/[0.06] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-2.5 w-48 sm:w-72 focus:outline-none focus:border-[--accent]/50 focus:bg-white/[0.08] transition-all placeholder:text-[--muted-dark]"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="ml-2 p-1.5 text-[--muted] hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="p-2.5 text-[--muted] hover:text-white transition-all rounded-xl hover:bg-white/[0.04]"
                >
                  <MagnifyingGlass className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      {!isWatchPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[--background]/90 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="flex items-center justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                    isActive
                      ? "text-[--accent]"
                      : "text-[--muted-dark] active:text-white"
                  }`}
                >
                  <link.icon className="w-5 h-5" weight={isActive ? "fill" : "regular"} />
                  <span className="text-[9px] font-medium truncate">{link.label}</span>
                </Link>
              );
            })}
            <Link
              href="/search"
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                pathname === "/search"
                  ? "text-[--accent]"
                  : "text-[--muted-dark] active:text-white"
              }`}
            >
              <MagnifyingGlass className="w-5 h-5" weight={pathname === "/search" ? "fill" : "regular"} />
              <span className="text-[9px] font-medium truncate">Search</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
