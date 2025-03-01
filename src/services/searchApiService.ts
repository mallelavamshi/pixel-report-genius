
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
 * @param queryText Optional query text (from image description)
 * @returns Promise with search results
 */
export const searchSimilarProducts = async (
  imageUrl: string, 
  apiKey: string, 
  queryText: string = "eBay"
): Promise<SearchResult[]> => {
  try {
    const params = new URLSearchParams({
      engine: 'google_lens',
      search_type: 'all',
      url: imageUrl,
      q: queryText,
      api_key: apiKey
    });

    const response = await fetch(`https://www.searchapi.io/api/v1/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`SearchAPI error: ${response.status}`);
    }

    const data = await response.json();
    console.log("SearchAPI response:", data);
    
    // Extract the visual matches from the response
    const visualMatches = data.visual_matches || [];
    
    // Transform to our format
    return visualMatches.map((match: any) => ({
      title: match.title || 'Unknown Product',
      source: match.source || match.link || 'Unknown Source',
      price: match.price || undefined,
      currency: match.price_currency || match.currency || undefined,
      extractedPrice: match.extracted_price || undefined,
    }));
  } catch (error) {
    console.error('Error searching with SearchAPI:', error);
    throw error;
  }
};
