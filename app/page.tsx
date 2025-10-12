import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find My Wedding Vendor
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Discover and connect with the best wedding vendors in your area
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Next.js migration in progress... This is a test page to verify SSG is working.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/states"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Browse by State
              </h2>
              <p className="text-gray-600">
                Find vendors across all 50 states
              </p>
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Search Coming Soon
              </h2>
              <p className="text-gray-600">
                Full search functionality being migrated
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Migration Status
            </h3>
            <p className="text-blue-700">
              ✅ Next.js setup complete<br />
              ✅ SSG configured<br />
              🔄 Components migration in progress<br />
              ⏳ Full feature parity coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
