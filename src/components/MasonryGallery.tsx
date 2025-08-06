import { useState, useEffect, useRef, useCallback } from 'react';
import PhotoAlbum from 'react-photo-album';
import { localImages, ImageData } from '../data/images';

interface Photo {
  src: string;
  width: number;
  height: number;
  key?: string;
}

export default function MasonryGallery() {
  const [visibleImages, setVisibleImages] = useState<ImageData[]>([]);
  const [loadedImages, setLoadedImages] = useState(new Set<number>());
  const observerRef = useRef<IntersectionObserver>();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial load: 30 images
  useEffect(() => {
    setVisibleImages(localImages.slice(0, 30));
  }, []);

  // Load next 70 images when user scrolls
  useEffect(() => {
    if (visibleImages.length === 30) {
      const timer = setTimeout(() => {
        setVisibleImages(localImages.slice(0, 100));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visibleImages]);

  // Load remaining images on scroll
  const loadMoreImages = useCallback(() => {
    if (visibleImages.length === 100 && visibleImages.length < localImages.length) {
      setVisibleImages(localImages);
    }
  }, [visibleImages]);

  // Intersection Observer for lazy loading remaining images
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreImages();
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMoreImages]);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  // Convert ImageData to Photo format for react-photo-album
  const photos: Photo[] = visibleImages.map((image) => ({
    src: image.url,
    width: image.width,
    height: image.height,
    key: image.id.toString(),
  }));

  return (
    <div className="min-h-screen bg-white p-3">
      <PhotoAlbum 
        layout="masonry"
        photos={photos}
        columns={(containerWidth) => {
          if (containerWidth < 768) return 2; // Mobile - 2 columns
          if (containerWidth < 1024) return 3; // Tablet - 3 columns
          return 4; // Desktop - 4 columns
        }}
        spacing={12}
        renderPhoto={({ photo, wrapperStyle }) => (
          <div style={wrapperStyle} className="relative overflow-hidden">
            <div
              style={{
                backgroundColor: loadedImages.has(parseInt(photo.key!)) ? 'transparent' : '#f3f4f6',
                width: '100%',
                height: '100%',
              }}
            >
              <img
                src={photo.src}
                alt=""
                className="w-full h-full object-cover"
                loading={parseInt(photo.key!) <= 30 ? "eager" : "lazy"}
                onLoad={() => handleImageLoad(parseInt(photo.key!))}
                style={{
                  opacity: loadedImages.has(parseInt(photo.key!)) ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
              />
            </div>
          </div>
        )}
      />
      
      {visibleImages.length === 100 && visibleImages.length < localImages.length && (
        <div ref={sentinelRef} className="h-1" />
      )}
    </div>
  );
}