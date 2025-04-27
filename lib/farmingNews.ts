import axios from 'axios';

const GNEWS_API_KEY = 'b5734a3e81ce004f9397a130a05d66ce';

// Mapping of state abbreviations to full names
const STATE_MAPPING: Record<string, string> = {
  'IA': 'Iowa',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'KS': 'Kansas',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MO': 'Missouri',
  'ND': 'North Dakota',
  'NE': 'Nebraska',
  'OH': 'Ohio',
  'SD': 'South Dakota',
  'WI': 'Wisconsin'
};

export const fetchFarmingNews = async (countyState: string) => {
  try {
    // Extract state abbreviation from the last 2 characters
    const stateAbbreviation = countyState.trim().slice(-2).toUpperCase();
    // Get full state name, fallback to using the abbreviation if not found
    const stateName = STATE_MAPPING[stateAbbreviation] || stateAbbreviation;
    
    const query = encodeURIComponent(`agriculture ${stateName}`);
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=3&apikey=${GNEWS_API_KEY}`;
    
    console.log(`Making news API request for state: ${stateName}`);
    console.log("Request URL:", url);
    
    // Rest of the function remains the same...
    const response = await axios.get(url);

    if (!response.data.articles || response.data.articles.length === 0) {
      console.log("No articles found for query. Trying fallback query...");

      const fallbackUrl = `https://gnews.io/api/v4/search?q=agriculture&lang=en&max=3&apikey=${GNEWS_API_KEY}`;
      const fallbackResponse = await axios.get(fallbackUrl);

      if (fallbackResponse.data.articles && fallbackResponse.data.articles.length > 0) {
        return fallbackResponse.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
        }));
      } else {
        return getMockFarmingNews();
      }
    }

    return response.data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
    }));
  } catch (error) {
    console.error('Error fetching farming news:', error);
    return getMockFarmingNews();
  }
};

export const getMockFarmingNews = () => [
  {
    title: "New Irrigation Technology Boosts Farm Production",
    description: "Smart irrigation systems help farmers in the Midwest reduce water usage while improving crop yields",
    url: "https://example.com/agriculture-news/1",
    publishedAt: new Date().toISOString(),
    source: "Farm Technology Today",
  },
  {
    title: "USDA Announces New Support Programs for Small Farms",
    description: "Federal initiative aims to help family-owned farms compete in the changing agricultural landscape",
    url: "https://example.com/agriculture-news/2",
    publishedAt: new Date().toISOString(),
    source: "Rural Economics Monitor",
  },
  {
    title: "Climate-Resilient Crop Varieties Show Promise in Field Tests",
    description: "New seed varieties developed for drought and heat resistance perform well in Midwest growing conditions",
    url: "https://example.com/agriculture-news/3",
    publishedAt: new Date().toISOString(),
    source: "Agricultural Science Weekly",
  }
];
