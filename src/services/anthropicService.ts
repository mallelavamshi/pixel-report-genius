
/**
 * Service for Anthropic API integration
 */

import { SearchResult } from './searchApiService';

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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and provide a detailed description. Then, examine these search results and tell me about similar products found online:
                ${JSON.stringify(searchResults, null, 2)}
                
                Please provide:
                1. A comprehensive description of what you see in the image
                2. Analysis of the search results - identify patterns, price ranges, popular models
                3. Your assessment of whether these results are a good match for the image
                4. Recommendations based on the search results
                
                Format your response in clear sections with headings.`
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Claude API response:", data);
    
    return data.content[0].text;
  } catch (error) {
    console.error('Error analyzing with Anthropic:', error);
    throw error;
  }
};
