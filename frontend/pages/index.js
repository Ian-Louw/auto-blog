import useSWR from 'swr';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import Loading from '../components/Loading';

const fetcher = (u) => fetch(u).then(r => r.json());

export default function Home() {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  const { data, error } = useSWR(`${base}/articles`, fetcher, { refreshInterval: 5000 });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-charcoal mb-4">
            AI-Powered Blog
          </h1>
          <p className="text-xl text-stone max-w-2xl mx-auto">
            Discover fresh content generated daily by advanced AI models.
            Stay informed with automatically curated articles on technology, innovation, and more.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center">
            <span className="bg-gold w-2 h-8 mr-3 rounded"></span>
            Latest Articles
          </h2>

          {!data && !error && <Loading />}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Failed to load articles. Please try again later.
            </div>
          )}

          {data && data.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-stone text-lg">No articles available yet.</p>
            </div>
          )}

          {data && data.length > 0 && (
            <div className="space-y-6">
              {data.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-cream rounded-xl p-6 border-l-4 border-gold">
          <h3 className="text-lg font-semibold text-charcoal mb-2">
            How It Works
          </h3>
          <p className="text-stone">
            Our AI model generates fresh, engaging content automatically.
            New articles are published daily at 2:00 AM UTC, covering various topics in technology and innovation.
          </p>
        </div>
      </div>
    </Layout>
  );
}
