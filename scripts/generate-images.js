// Node.js script to generate image list from public/images folder
// Run with: node scripts/generate-images.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dimensionsFile = path.join(__dirname, 'image_dimensions.json');
const outputFile = path.join(__dirname, '../src/data/generated-images.ts');

try {
  // Read dimensions from Python script output
  const dimensionsData = JSON.parse(fs.readFileSync(dimensionsFile, 'utf8'));
  
  let output = `// Auto-generated image list
import { ImageData } from './images';

export const generatedImages: ImageData[] = [
`;

  dimensionsData.forEach((imageData, index) => {
    const id = index + 1;
    const url = `/compressed/${imageData.filename}`;
    const width = imageData.width;
    const height = imageData.height;
    
    output += `  { id: ${id}, url: '${url}', width: ${width}, height: ${height} },\n`;
  });

  output += `];
`;

  fs.writeFileSync(outputFile, output);
  console.log(`✅ Generated ${dimensionsData.length} images with actual dimensions in ${outputFile}`);

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('💡 Make sure to run: python3 scripts/get_image_dimensions.py first');
}