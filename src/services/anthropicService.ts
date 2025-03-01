
/**
 * Service for Anthropic API integration
 */

import { SearchResult } from './searchApiService';

// Add AbortSignal.timeout polyfill if not available
if (!AbortSignal.timeout) {
  AbortSignal.timeout = function timeout(ms: number) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error('Timeout')), ms);
    return controller.signal;
  };
}

/**
 * Analyzes an image and search results using Anthropic's Claude
 * @param imageUrl URL of the image to analyze
 * @param searchResults Results from search API
 * @param apiKey Anthropic API key
 * @returns Promise with analysis result
 */
export const analyzeImageWithClaude = async (
  imageUrl: string, 
  searchResults: SearchResult[], 
  apiKey: string
): Promise<string> => {
  try {
    console.log("Starting Claude analysis with:", { imageUrl, searchResults: searchResults.length });
    
    // Ensure the API key is valid
    if (!apiKey) {
      throw new Error("Anthropic API key is missing");
    }
    
    // Format search results for the prompt
    const formattedResults = searchResults.map(result => ({
      title: result.title,
      source: result.source,
      price: result.price,
      currency: result.currency,
      link: result.link
    }));
    
    // Prepare the prompt for Claude
    const prompt = `Analyze this image in detail and provide a comprehensive assessment.

Based on the search results below, identify what this item is and provide a detailed analysis:
${JSON.stringify(formattedResults, null, 2)}

Format your response like this:
• Name: "[Item Name]" 
• Opinion: [Detailed assessment of the item, including its collectibility, value, rarity]
• [Marketplace name] prices: [Price range found]
• [Other marketplace] prices: [Price range found]
• [Other retailers] prices: [Price info if available]
• [Auction Houses]: [Information about auction appearances if relevant]
• Additional Note: [Any important buying advice, authentication concerns, or other relevant details]

Your analysis should be detailed but concise. Include any distinctive features, maker marks, or identifiers that would help in determining authenticity or value.`;
    
    console.log("Sending request to Anthropic API");
    
    // Use a longer timeout for Claude (90 seconds)
    const timeoutSignal = AbortSignal.timeout(90000);
    
    try {
      // Construct request payload
      const payload = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl
                }
              }
            ]
          }
        ]
      };
      
      console.log("Claude API payload:", JSON.stringify(payload).replace(imageUrl, "IMAGE_URL_HIDDEN"));
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: timeoutSignal,
        cache: 'no-cache',
      });

      if (!response.ok) {
        let errorMessage = `Anthropic API error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error(`Anthropic API error (${response.status}):`, errorData);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          const errorText = await response.text();
          console.error(`Anthropic API error (${response.status}):`, errorText);
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Claude API response received:", data ? "data received" : "no data");
      
      if (!data.content || data.content.length === 0 || !data.content[0].text) {
        console.error("Unexpected Claude API response format:", data);
        throw new Error("Invalid response from Claude API");
      }
      
      return data.content[0].text;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Anthropic API request timed out after 90 seconds');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error analyzing with Anthropic:', error);
    throw error;
  }
};
