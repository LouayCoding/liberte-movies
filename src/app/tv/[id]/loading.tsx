export default function TVDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="relative w-full h-[30vh] sm:h-[40vh] bg-white/[0.02] animate-pulse" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Mobile skeleton */}
        <div className="flex sm:hidden -mt-28 mb-6 gap-4">
          <div className="shrink-0 w-[120px] h-[180px] bg-white/[0.04] rounded-xl animate-pulse" />
          <div className="pt-8 flex-1 space-y-3">
            <div className="h-6 w-3/4 bg-white/[0.04] rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-14 bg-white/[0.04] rounded-md animate-pulse" />
              <div className="h-6 w-10 bg-white/[0.03] rounded-md animate-pulse" />
            </div>
          </div>
        </div>

        {/* Desktop skeleton */}
        <div className="hidden sm:flex gap-10 -mt-20 mb-8">
          <div className="shrink-0 w-[240px] h-[360px] bg-white/[0.04] rounded-2xl animate-pulse" />
          <div className="flex-1 pt-6 space-y-4">
            <div className="h-10 w-80 max-w-full bg-white/[0.04] rounded-xl animate-pulse" />
            <div className="h-5 w-48 bg-white/[0.03] rounded-lg animate-pulse" />
            <div className="flex gap-3">
              <div className="h-7 w-16 bg-white/[0.04] rounded-lg animate-pulse" />
              <div className="h-7 w-28 bg-white/[0.03] rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2 max-w-2xl">
              <div className="h-4 w-full bg-white/[0.04] rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-white/[0.04] rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-white/[0.03] rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-36 bg-white/[0.05] rounded-xl animate-pulse" />
              <div className="h-11 w-28 bg-white/[0.03] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Seasons skeleton - horizontal scroll */}
        <div className="mb-10">
          <div className="h-5 w-20 bg-white/[0.04] rounded-lg mb-3 animate-pulse" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[130px]">
                <div className="aspect-[2/3] bg-white/[0.04] rounded-xl animate-pulse" />
                <div className="mt-2 h-3 w-3/4 bg-white/[0.03] rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Cast skeleton */}
        <div className="mb-10">
          <div className="h-5 w-16 bg-white/[0.04] rounded-lg mb-3 animate-pulse" />
          <div className="flex gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[100px] flex flex-col items-center">
                <div className="w-[100px] h-[100px] rounded-full bg-white/[0.04] animate-pulse" />
                <div className="mt-2 h-3 w-16 bg-white/[0.03] rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
