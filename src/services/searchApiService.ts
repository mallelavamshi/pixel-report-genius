
/**
 * Service for SearchAPI integration
 */

export type SearchResult = {
  title: string;
  source: string;
  price?: string;
  currency?: string;
  extractedPrice?: number;
};

/**
 * Searches for similar products using SearchAPI
 * @param imageUrl URL of the image to search
 * @param apiKey The SearchAPI key
 * @returns Promise with search results
 */
export const searchSimilarProducts = async (imageUrl: string, apiKey: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch('https://serpapi.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        engine: 'google_lens',
        url: imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`SearchAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the first 15 visual matches
    const visualMatches = data.visual_matches?.slice(0, 15) || [];
    
    // Transform to our format
    return visualMatches.map((match: any) => ({
      title: match.title || 'Unknown Product',
      source: match.source || match.link || 'Unknown Source',
      price: match.price || undefined,
      currency: match.price_currency || undefined,
      extractedPrice: match.extracted_price || undefined,
    }));
  } catch (error) {
    console.error('Error searching with SearchAPI:', error);
    throw error;
  }
};
