'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Offline</h1>
          <p className="text-gray-600">
            It looks like you've lost your internet connection. Please check your network and try
            again.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>

          <div className="text-sm text-gray-500">
            <p className="mb-2">While you're offline, you can:</p>
            <ul className="text-left space-y-1 pl-4">
              <li>• View previously loaded content</li>
              <li>• Browse cached pages</li>
              <li>• Check your dashboard</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Amealio will automatically reconnect when you're back online
          </p>
        </div>
      </div>
    </div>
  );
}
