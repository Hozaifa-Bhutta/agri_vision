import axios from 'axios';

export const fetchFarmingNews = async (countyState: string) => {
  try {
    const apiKey = "api_live_N1GSprVYB6qKw3RhSJFKsAkP10bJD1WxjxBb7KQ7xk77LpbkGbPlq2Cf"; // Replace with your actual API key
    const query = encodeURIComponent(countyState);
    const url = `https://api.apitube.io/v1/news/everything?q=${query}&category=agriculture&language=en&api_key=${apiKey}&per_page=50`;

    const response = await axios.get(url);
    const articles = response.data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.published_at,
      source: article.source.name
    }));
    console.log("Fetched farming news:", articles);
    return articles;

  } catch (error) {
    console.error('Error fetching farming news:', error);
    throw error;
  }
};
