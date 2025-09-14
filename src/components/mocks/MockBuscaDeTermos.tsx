export default function MockBuscaDeTermos() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        <div className="flex-1 h-4 bg-gray-600 rounded ml-2"></div>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="h-10 bg-gray-700 rounded-lg border border-gray-600 flex items-center px-3">
          <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="h-4 bg-gray-600 rounded w-32"></div>
        </div>
      </div>
      
      {/* Content Lines */}
      <div className="space-y-3">
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-4/5"></div>
        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-blue-500 rounded w-1/2"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
      
      {/* Bottom Actions */}
      <div className="mt-auto flex gap-2">
        <div className="h-8 bg-blue-600 rounded w-20"></div>
        <div className="h-8 bg-gray-600 rounded w-16"></div>
      </div>
    </div>
  );
}
