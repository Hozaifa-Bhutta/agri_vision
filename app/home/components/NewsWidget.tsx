import React, { useEffect, useState } from 'react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
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
        
        if (data.success && data.result) {
          setNews(data.result.slice(0, 5)); // Get just the first 5 articles
        } else {
          setError(data.error || 'Failed to fetch news');
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Truncate text to a certain length
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Agricultural News</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Agricultural News</h2>
        <p className="text-xs text-gray-500">
          News for {formatLocation ? formatLocation(county_state) : county_state}
        </p>
      </div>
      
      {news.length === 0 ? (
        <p className="text-gray-700">No recent news found for your area.</p>
      ) : (
        <div className="space-y-4">
          {news.map((article, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-medium text-gray-900 hover:text-blue-600">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {truncateText(article.title, 100)}
                  </a>
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {truncateText(article.description || '', 150)}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  Source: {article.source}
                </span>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Read more
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsWidget; 