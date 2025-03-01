
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
    console.log("Starting ImgBB upload for file:", imageFile.name);
    
    // Check for missing API key
    if (!apiKey) {
      console.error("ImgBB API key is missing");
      throw new Error("ImgBB API key is missing");
    }

    // Validate the file
    if (!imageFile || !(imageFile instanceof File)) {
      console.error("Invalid image file provided");
      throw new Error("Invalid image file provided");
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('key', apiKey);
    formData.append('expiration', '600'); // 10 minutes expiration as per requirements
    
    console.log("Sending request to ImgBB API");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ImgBB API error (${response.status}):`, errorText);
        throw new Error(`ImgBB API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("ImgBB upload response received:", data ? "data received" : "no data");
      
      if (!data.success) {
        console.error("ImgBB upload failed:", data);
        throw new Error('Failed to upload image to ImgBB');
      }

      // Return the direct image URL
      return data.data.url;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('ImgBB upload timed out after 30 seconds');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};

/**
 * Converts a data URL or blob URL to a File object
 * @param url Data URL or blob URL
 * @param filename Desired filename
 * @returns Promise with File object
 */
export const urlToFile = async (url: string, filename: string = 'image.jpg'): Promise<File> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Error converting URL to File:', error);
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
    
    img.onerror = (e) => {
      console.error('Error loading image for resizing:', e);
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Convert a blob URL to a base64 data URL
 * @param blobUrl The blob URL to convert
 * @returns Promise with the data URL
 */
export const blobUrlToDataUrl = async (blobUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      fetch(blobUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
