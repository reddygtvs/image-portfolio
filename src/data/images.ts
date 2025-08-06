// TypeScript interfaces
export interface ImageData {
  id: number;
  url: string;
  width: number;
  height: number;
}

// Import generated images
import { generatedImages } from './generated-images';

// Your local images - now using generated image data
export const localImages: ImageData[] = generatedImages;

// For production with Cloudflare Images
export const cloudflareImages: ImageData[] = [
  // Replace with your Cloudflare URLs like:
  // { id: 1, url: 'https://imagedelivery.net/[account-hash]/[image-id]/public', width: 800, height: 1200 },
];

// Utility function for Cloudflare Images responsive URLs
export const getCloudflareUrl = (baseUrl: string, width: number): string => {
  return baseUrl.replace('/public', `/w=${width},quality=85,format=auto`);
};