export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse" data-testid="skeleton-card">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex justify-between items-center pt-3">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-9 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonDetail = () => {
  return (
    <div className="animate-pulse" data-testid="skeleton-detail">
      <div className="w-full h-96 md:h-[500px] bg-gray-200 rounded-lg mb-6"></div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};
