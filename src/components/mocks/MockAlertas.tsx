export default function MockAlertas() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          <div className="h-4 bg-gray-600 rounded w-20"></div>
        </div>
        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
      </div>
      
      {/* Notification List */}
      <div className="space-y-3 flex-1">
        <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-purple-500">
          <div className="h-3 bg-gray-600 rounded w-full mb-1"></div>
          <div className="h-2 bg-gray-600 rounded w-2/3"></div>
        </div>
        <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
          <div className="h-3 bg-gray-600 rounded w-full mb-1"></div>
          <div className="h-2 bg-gray-600 rounded w-3/4"></div>
        </div>
        <div className="p-3 bg-gray-700 rounded-lg border-l-4 border-green-500">
          <div className="h-3 bg-gray-600 rounded w-full mb-1"></div>
          <div className="h-2 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="mt-auto flex gap-2">
        <div className="h-8 bg-purple-600 rounded w-24"></div>
        <div className="h-8 bg-gray-600 rounded w-16"></div>
      </div>
    </div>
  );
}
