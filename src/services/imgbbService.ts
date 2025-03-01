
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
    formData.append('expiration', '600'); // 10 minutes expiration as per requirements

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("ImgBB upload response:", data);
    
    if (!data.success) {
      throw new Error('Failed to upload image to ImgBB');
    }

    return data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};

/**
 * Resize an image maintaining aspect ratio
 * @param imageUrl Image URL
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @returns A promise with the resized image as a data URL
 */
export const resizeImage = async (imageUrl: string, maxWidth: number = 200, maxHeight: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
      }
      
      // Create canvas and resize image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Return resized image as data URL
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = imageUrl;
  });
};
