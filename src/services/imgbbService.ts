
/**
 * Service for imgBB API integration
 */

/**
 * Uploads an image to imgBB and returns the URL
 * @param imageFile The image file to upload
 * @param apiKey The imgBB API key
 * @returns Promise with the image URL
 */
export const uploadImageToImgBB = async (imageFile: File, apiKey: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('key', apiKey);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to upload image to ImgBB');
    }

    return data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};
