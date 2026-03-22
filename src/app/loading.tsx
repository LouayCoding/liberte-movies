export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[65vh] sm:h-[80vh] bg-white/[0.02] animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 max-w-3xl space-y-4">
          <div className="h-10 w-96 max-w-full bg-white/[0.04] rounded-xl" />
          <div className="flex gap-3">
            <div className="h-7 w-20 bg-white/[0.04] rounded-lg" />
            <div className="h-7 w-24 bg-white/[0.03] rounded-lg" />
          </div>
          <div className="h-4 w-full max-w-xl bg-white/[0.03] rounded-lg" />
          <div className="h-4 w-3/4 max-w-md bg-white/[0.02] rounded-lg" />
          <div className="flex gap-3 pt-2">
            <div className="h-11 w-36 bg-white/[0.05] rounded-xl" />
            <div className="h-11 w-32 bg-white/[0.03] rounded-xl" />
          </div>
        </div>
      </div>

      {/* Row Skeletons */}
      <div className="relative -mt-20 z-10 flex flex-col gap-10 pb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 sm:px-6">
            <div className="h-5 w-48 bg-white/[0.04] rounded-lg mb-4 animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="flex-shrink-0 w-[150px] sm:w-[175px]">
                  <div className="aspect-[2/3] bg-white/[0.04] rounded-xl animate-pulse" />
                  <div className="mt-2.5 h-4 w-3/4 bg-white/[0.03] rounded-lg animate-pulse" />
                  <div className="mt-1.5 h-3 w-1/2 bg-white/[0.02] rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
