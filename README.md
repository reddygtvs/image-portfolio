# Photography Portfolio

A responsive photography portfolio website built with React, TypeScript, and Vite. Features a masonry grid layout with lazy loading and WebP image optimization.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Python scripts for image processing

## Development

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Adding Images

1. Add images to `public/images/` directory
2. Run the image processing scripts:
   ```bash
   python3 scripts/get_image_dimensions.py
   node scripts/generate-images.js
   ```

The scripts will:
- Extract image dimensions and generate metadata
- Create TypeScript definitions for the images
- Images are automatically included in the gallery

## Image Optimization

The project includes scripts to compress images to WebP format:
```bash
python3 scripts/test_compression.py
```

This creates optimized versions in `public/compressed/` directory.

## Project Structure

```
src/
├── components/MasonryGallery.tsx   # Main gallery component
├── data/
│   ├── images.ts                   # Image interfaces and exports
│   └── generated-images.ts         # Auto-generated image data
└── App.tsx                         # Main app component

scripts/
├── get_image_dimensions.py         # Extract image metadata
├── generate-images.js              # Generate TypeScript image data
└── test_compression.py             # WebP compression utility
```

## Features

- Responsive masonry layout (3-5 columns based on screen size)
- Progressive image loading with smooth animations
- Lazy loading for performance
- Mobile-optimized interface
- WebP image compression
- TypeScript for type safety

## Deployment

The built files in `dist/` can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).
