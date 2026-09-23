export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto w-full">
      {/* Banner Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 h-28 flex flex-col justify-center space-y-2">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
      </div>

      {/* Farm Overview Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg p-3"></div>
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-3">
        <div className="h-5 bg-slate-200 rounded w-1/5"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>

      {/* Information Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 bg-slate-100 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}
