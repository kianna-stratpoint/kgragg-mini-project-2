export default async function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 font-playfair-display">
          Blog Posts
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the latest commute stories and practical tips. From your
          daily route to hidden shortcuts, stay updated with real stories from
          fellow Filipino commuters.
        </p>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ... Your blog card placeholders ... */}
        <div className="h-64 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
          Blog Post Placeholder
        </div>
      </div>
    </div>
  );
}
