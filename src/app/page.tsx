import TopNavBar from "@/components/layout/TopNavBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <TopNavBar />

      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the latest commute stories and practical tips. From your
            daily route to hidden shortcuts, stay updated with real stories from
            fellow Filipino commuters.
          </p>
        </div>

        {/* Blog cards will go here later */}
      </div>
    </main>
  );
}
