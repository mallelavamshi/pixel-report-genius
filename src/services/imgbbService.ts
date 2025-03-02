/**
 * Service for imgBB API integration
 */

/**
 * Validates if a URL is properly formatted
 * @param url URL to validate
 * @returns Boolean indicating validity
 */
const isValidUrl = (url: string): boolean => {
  try {
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return true;
    }
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Uploads an image to imgBB and returns the URL
 * @param imageFile The image file to upload
 * @param apiKey The imgBB API key
 * @returns Promise with the image URL
 */
export const uploadImageToImgBB = async (imageFile: File | string, apiKey: string): Promise<string> => {
  try {
    console.log("Starting ImgBB upload for file:", typeof imageFile === 'string' ? 'image URL' : imageFile.name);
    
    // Check for missing API key
    if (!apiKey) {
      console.error("ImgBB API key is missing");
      throw new Error("ImgBB API key is missing");
    }

    // Convert URL to File if needed
    let fileToUpload: File;
    if (typeof imageFile === 'string') {
      fileToUpload = await urlToFile(imageFile, 'image.jpg');
    } else if (imageFile instanceof File) {
      fileToUpload = imageFile;
    } else {
      throw new Error("Invalid image file provided");
    }
    
    const formData = new FormData();
    // For ImgBB API, we need to convert the file to base64
    const base64Data = await fileToBase64(fileToUpload);
    formData.append('image', base64Data);
    formData.append('key', apiKey);
    
    console.log("Sending request to ImgBB API");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), 30000);
    
    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ImgBB API error (${response.status}):`, errorText);
        throw new Error(`ImgBB API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("ImgBB upload response received");
      
      if (!data.success) {
        console.error("ImgBB upload failed:", data);
        throw new Error('Failed to upload image to ImgBB');
      }

      // Return the direct image URL
      if (!data.data || !data.data.url || !isValidUrl(data.data.url)) {
        console.error("ImgBB returned invalid URL:", data);
        throw new Error('ImgBB returned invalid URL');
      }
      
      console.log("ImgBB upload successful, URL:", data.data.url);
      return data.data.url;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('ImgBB upload timed out after 30 seconds');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};

/**
 * Converts a file to base64 string
 * @param file File to convert
 * @returns Promise with base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let result = reader.result as string;
      // Remove the data URL prefix if it exists (ImgBB only wants the base64 part)
      if (result.includes('base64,')) {
        result = result.split('base64,')[1];
      }
      resolve(result);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Converts a data URL or blob URL to a File object
 * @param url Data URL or blob URL
 * @param filename Desired filename
 * @returns Promise with File object
 */
export const urlToFile = async (url: string, filename: string = 'image.jpg'): Promise<File> => {
  try {
    // Handle data URL input
    if (url.startsWith('data:')) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type });
    }
    
    // Handle blob URL input
    if (url.startsWith('blob:')) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type });
    }
    
    // Handle regular URL
    const response = await fetch(url, {
      mode: 'cors', // Try with CORS
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
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
    
    // Add timeout to prevent hanging on image load
    const timeoutId = setTimeout(() => {
      img.src = '';
      reject(new Error('Image loading timed out'));
    }, 15000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
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
      clearTimeout(timeoutId);
      console.error('Error loading image for resizing:', e);
      reject(new Error('Failed to load image for resizing'));
    };
    
    // If the imageUrl is a blob URL or data URL, just use it directly
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      img.src = imageUrl;
    } else {
      // For regular URLs, try to fetch with CORS
      fetch(imageUrl, { mode: 'cors', cache: 'no-cache' })
        .then(response => response.blob())
        .then(blob => {
          const objectURL = URL.createObjectURL(blob);
          img.src = objectURL;
        })
        .catch(err => {
          // If fetching fails, try loading the URL directly
          console.warn('Error fetching image with CORS, trying direct load:', err);
          img.src = imageUrl;
        });
    }
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
      if (!blobUrl.startsWith('blob:')) {
        // If it's already a data URL, just return it
        if (blobUrl.startsWith('data:')) {
          resolve(blobUrl);
          return;
        }
        console.error('Invalid blob URL provided:', blobUrl);
        reject(new Error('Invalid blob URL provided'));
        return;
      }
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Blob URL conversion timed out'));
      }, 15000);
      
      fetch(blobUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch blob URL: ${response.status} ${response.statusText}`);
          }
          return response.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            clearTimeout(timeoutId);
            resolve(reader.result as string);
          };
          reader.onerror = (error) => {
            clearTimeout(timeoutId);
            reject(error);
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};