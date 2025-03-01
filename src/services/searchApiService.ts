
/**
 * Service for SearchAPI integration
 */

// Add AbortSignal.timeout polyfill if not available
if (!AbortSignal.timeout) {
  AbortSignal.timeout = function timeout(ms: number) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

export type SearchResult = {
  title: string;
  source: string;
  price?: string;
  currency?: string;
  extractedPrice?: number;
  link?: string;
  thumbnail?: string;
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
    
    // Define markets to search based on user input or defaults
    const searchQuery = queryText || "eBay Etsy collectible";
    
    const params = new URLSearchParams({
      engine: 'google_lens',
      search_type: 'products',
      url: imageUrl,
      q: searchQuery, 
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
    
    // Transform to our format and limit to first 15 results
    return data.visual_matches.slice(0, 15).map((match: any) => ({
      title: match.title || 'Unknown Product',
      source: match.source || match.link || 'Unknown Source',
      price: match.price || undefined,
      currency: match.currency || undefined,
      extractedPrice: match.extracted_price || undefined,
      link: match.link || undefined,
      thumbnail: match.thumbnail || match.image?.link || undefined,
    }));
  } catch (error) {
    console.error('Error searching with SearchAPI:', error);
    throw error;
  }
};
