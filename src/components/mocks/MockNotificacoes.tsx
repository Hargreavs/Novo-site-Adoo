export default function MockNotificacoes() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <div className="h-4 bg-gray-600 rounded w-24"></div>
        </div>
        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      {/* Settings */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-600 rounded w-20"></div>
          <div className="w-8 h-4 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-600 rounded w-16"></div>
          <div className="w-8 h-4 bg-gray-600 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-600 rounded w-18"></div>
          <div className="w-8 h-4 bg-green-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="space-y-2 flex-1">
        <div className="h-2 bg-gray-600 rounded w-16"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}
