/**
 * Service for SearchAPI integration
 */

export type SearchResult = {
  title: string;
  source: string;
  price?: string;
  currency?: string;
  extractedPrice?: number;
  link?: string;
  thumbnail?: string;
  position?: number;
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
    
    // Define search query based on user input or defaults
    const searchQuery = queryText || "eBay Etsy collectible";
    
    // Construct the API URL with query parameters
    const params = {
      engine: 'google_lens',
      search_type: 'products',
      url: imageUrl,
      q: searchQuery, 
      api_key: apiKey
    };
    
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
      
    const apiUrl = `https://www.searchapi.io/api/v1/search?${queryString}`;
    
    console.log("Sending request to SearchAPI");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), 45000);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SearchAPI error (${response.status}):`, errorText);
        throw new Error(`SearchAPI error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("SearchAPI response received");
      
      if (!data || !data.visual_matches || !Array.isArray(data.visual_matches)) {
        console.warn("No visual matches found in SearchAPI response");
        return [];
      }
      
      // Transform to our format and limit to first 15 results
      const results = data.visual_matches.slice(0, 15).map((match: any) => ({
        title: match.title || 'Unknown Product',
        source: match.source || 'Unknown Source',
        price: match.price || undefined,
        currency: match.currency || undefined,
        extractedPrice: match.extracted_price || undefined,
        link: match.link || undefined,
        thumbnail: match.thumbnail || (match.image ? match.image.link : undefined),
        position: match.position || undefined
      }));
      
      console.log(`SearchAPI returned ${results.length} results`);
      return results;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('SearchAPI request timed out after 45 seconds');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error searching with SearchAPI:', error);
    throw error;
  }
};