/**
 * API service for Virtual Try-On backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface TryOnImageResponse {
  success: boolean;
  image_path: string;
  message: string;
  description?: string;
}

export interface TryOnVideoResponse {
  success: boolean;
  video_path: string;
  message: string;
  description?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * Convert a base64 string or File to a Blob
 */
function base64ToBlob(base64: string, contentType: string = 'image/png'): Blob {
  // Remove data URL prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

/**
 * Generate a virtual try-on image
 * @param personImage - Person's photo (base64 string or File)
 * @param clothingImage - Clothing photo (base64 string or File)
 * @returns Response with path to generated image
 */
export async function generateTryOnImage(
  personImage: string | File,
  clothingImage: string | File
): Promise<TryOnImageResponse> {
  const formData = new FormData();

  // Handle person image
  if (typeof personImage === 'string') {
    const blob = base64ToBlob(personImage);
    formData.append('person_image', blob, 'person.png');
  } else {
    formData.append('person_image', personImage);
  }

  // Handle clothing image - need to fetch it from public URL
  if (typeof clothingImage === 'string') {
    // If it's a URL path like /clothes/men/image.jpg
    if (clothingImage.startsWith('/')) {
      const response = await fetch(clothingImage);
      const blob = await response.blob();
      formData.append('clothing_image', blob, 'clothing.jpg');
    } else {
      // If it's a base64 string
      const blob = base64ToBlob(clothingImage);
      formData.append('clothing_image', blob, 'clothing.png');
    }
  } else {
    formData.append('clothing_image', clothingImage);
  }

  const response = await fetch(`${API_BASE_URL}/api/generate-tryon-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate try-on image');
  }

  return await response.json();
}

/**
 * Generate a video from a try-on image
 * @param tryonImagePath - Path to the try-on image on the backend
 * @returns Response with path to generated video
 */
export async function generateTryOnVideo(
  tryonImagePath: string
): Promise<TryOnVideoResponse> {
  // Extract filename from path
  const filename = tryonImagePath.split(/[\\/]/).pop() || 'tryon_image.png';

  // Download the image from the backend
  const imageUrl = `${API_BASE_URL}/api/download/image/${filename}`;
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error('Failed to fetch try-on image from backend');
  }

  const imageBlob = await imageResponse.blob();

  const formData = new FormData();
  formData.append('tryon_image', imageBlob, filename);

  const response = await fetch(`${API_BASE_URL}/api/generate-tryon-video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate try-on video');
  }

  return await response.json();
}

/**
 * Get the URL to download a generated file
 * @param filePath - Full path to the file on the backend
 * @param fileType - Type of file ('image' or 'video')
 * @returns URL to download the file
 */
export function getDownloadUrl(filePath: string, fileType: 'image' | 'video'): string {
  const filename = filePath.split(/[\\/]/).pop() || '';
  return `${API_BASE_URL}/api/download/${fileType}/${filename}`;
}

/**
 * Check if the API server is running
 * @returns True if server is responding
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
