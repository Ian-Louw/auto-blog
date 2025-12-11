import Link from 'next/link';

export default function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="article-card">
      <Link href={`/articles/${article.id}`}>
        <div className="cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-2xl font-bold text-charcoal hover:text-gold transition-colors flex-1">
              {article.title}
            </h2>
            <div className="ml-4 flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold text-charcoal">
                AI Generated
              </span>
            </div>
          </div>

          <p className="text-stone text-base leading-relaxed mb-4 line-clamp-3">
            {article.content}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-cream">
            <div className="flex items-center text-sm text-stone">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(article.createdAt)}
            </div>

            <span className="text-gold font-medium hover:underline">
              Read more →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
