import Link from 'next/link';
import { Search, BookOpen, Zap, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Collectiv</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="text-gray-600 hover:text-gray-900 font-medium">
              Explore
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
              About
            </Link>
            <Link href="/contribute" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Contribute
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The World-Class Encyclopedia
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Collectiv is a comprehensive, AI-optimized knowledge base with intelligent cross-references,
            multimedia content, and dynamic interconnection of ideas.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Collectiv..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 my-20">
          <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Optimized</h3>
            <p className="text-gray-600">
              Next-generation search and content discovery powered by modern AI algorithms.
            </p>
          </div>

          <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Rich Content</h3>
            <p className="text-gray-600">
              Multimedia articles with images, videos, and interactive visualizations.
            </p>
          </div>

          <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Community Driven</h3>
            <p className="text-gray-600">
              Built by contributors worldwide, with rigorous editorial standards.
            </p>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="my-20">
          <h2 className="text-3xl font-bold mb-8">Explore by Category</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              '📚 Science & Technology',
              '🌍 Geography & Nature',
              '🎨 Arts & Culture',
              '⚡ History & Politics',
              '🚀 Innovation',
              '🧬 Biology & Medicine',
              '💡 Philosophy & Ideas',
              '🎭 Entertainment',
            ].map((category) => (
              <Link
                key={category}
                href={`/category/${category.split(' ')[1]}`}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition text-center font-medium"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        <div className="my-20">
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Link
                key={i}
                href={`/article/example-${i}`}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-48" />
                <div className="p-6">
                  <h3 className="text-xl font-bold group-hover:text-blue-600 transition">
                    Featured Article {i}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <span>Read more →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Explore</h4>
              <ul className="space-y-2">
                <li><Link href="/explore" className="text-gray-600 hover:text-gray-900">All Articles</Link></li>
                <li><Link href="/categories" className="text-gray-600 hover:text-gray-900">Categories</Link></li>
                <li><Link href="/random" className="text-gray-600 hover:text-gray-900">Random Article</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Contribute</h4>
              <ul className="space-y-2">
                <li><Link href="/contribute" className="text-gray-600 hover:text-gray-900">Write</Link></li>
                <li><Link href="/edit" className="text-gray-600 hover:text-gray-900">Edit</Link></li>
                <li><Link href="/guidelines" className="text-gray-600 hover:text-gray-900">Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Community</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-gray-900">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link></li>
                <li><Link href="/license" className="text-gray-600 hover:text-gray-900">License</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2026 Collectiv. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
