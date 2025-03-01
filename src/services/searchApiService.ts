
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
    console.log("Starting SearchAPI search with:", { imageUrl, queryText });
    
    // Check for missing API key
    if (!apiKey) {
      throw new Error("SearchAPI key is missing");
    }
    
    // Check for valid URL
    if (!imageUrl) {
      throw new Error("Invalid image URL provided");
    }
    
    const params = new URLSearchParams({
      engine: 'google_lens',
      search_type: 'all',
      url: imageUrl,
      q: queryText || "eBay", // Default to eBay if queryText is empty
      api_key: apiKey
    });

    const apiUrl = `https://www.searchapi.io/api/v1/search?${params.toString()}`;
    console.log("Sending request to SearchAPI:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SearchAPI error (${response.status}):`, errorText);
      throw new Error(`SearchAPI error: ${response.status}`);
    }

    const data = await response.json();
    console.log("SearchAPI response:", data);
    
    // Handle case where visual_matches is missing
    if (!data.visual_matches || !Array.isArray(data.visual_matches)) {
      console.warn("No visual matches found in SearchAPI response");
      return [];
    }
    
    // Transform to our format
    return data.visual_matches.map((match: any) => ({
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
