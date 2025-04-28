import React, { useEffect, useState } from 'react';

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string; url?: string };
  image?: string;
  content?: string;
}

interface NewsWidgetProps {
  county_state?: string;
  formatLocation?: (location: string | undefined) => string;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({ county_state, formatLocation }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!county_state) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/GET?action=getFarmingNews&countyState=${encodeURIComponent(county_state)}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching news: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.result)) {
          // Take the first 4 articles with valid data
          const validArticles = data.result
            .filter((article: any) => 
              article && typeof article.title === 'string' && article.title.trim() !== ''
            )
            .slice(0, 4);
            
          setNews(validArticles);
        } else {
          console.warn("Unexpected API response structure:", data);
          setError('Failed to fetch news: Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [county_state]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Recent";
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {
      return "Recent";
    }
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Agricultural News</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded md:col-span-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !county_state) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Agricultural News</h2>
        <p className="text-gray-700">
          {!county_state 
            ? "Please set your location to view local agricultural news." 
            : `Unable to load news: ${error}`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Agricultural News</h2>
        <p className="text-xs text-gray-500">
          News for {formatLocation ? formatLocation(county_state) : county_state}
        </p>
      </div>
      
      {news.length === 0 ? (
        <p className="text-gray-700">No recent news found for your area.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((article, index) => (
            <div key={index} className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${index >= 2 ? 'col-span-1 md:col-span-1' : ''}`}>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
                {article.image && (
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Handle image loading errors
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 bg-green-600 text-white text-xs px-2 py-1">
                      {article.source?.name || 'News'}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {truncateText(article.title, 85)}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 min-h-[3rem]">
                    {truncateText(article.description, 100)}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="text-green-600">Read more →</span>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsWidget; 