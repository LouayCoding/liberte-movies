export default function MoviesLoading() {
  return (
    <div className="pt-24 pb-12 max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="h-9 w-32 bg-white/[0.04] rounded-xl mb-2 animate-pulse" />
      <div className="h-5 w-48 bg-white/[0.03] rounded-lg mb-8 animate-pulse" />

      <div className="flex flex-wrap gap-2 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-white/[0.04] rounded-xl animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[2/3] bg-white/[0.04] rounded-xl animate-pulse" />
            <div className="mt-2.5 h-4 w-3/4 bg-white/[0.03] rounded-lg animate-pulse" />
            <div className="mt-1.5 h-3 w-1/2 bg-white/[0.02] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
