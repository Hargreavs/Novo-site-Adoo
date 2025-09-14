export default function MockCentral() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <div className="h-4 bg-gray-600 rounded w-24"></div>
        </div>
        <div className="w-6 h-6 bg-gray-600 rounded"></div>
      </div>
      
      {/* Filter Bar */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-blue-500 rounded-full w-16"></div>
        <div className="h-6 bg-gray-600 rounded-full w-20"></div>
        <div className="h-6 bg-gray-600 rounded-full w-14"></div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          <div className="h-2 bg-gray-600 rounded w-1/2"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          <div className="h-2 bg-gray-600 rounded w-3/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-4/5"></div>
          <div className="h-2 bg-gray-600 rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          <div className="h-2 bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
