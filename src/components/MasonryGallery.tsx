import { useState, useEffect, useRef, useCallback } from 'react';
import { localImages, ImageData } from '../data/images';

interface MasonryImage extends ImageData {
  shouldCrop: boolean;
  cropPercentage: number;
  columnIndex: number;
}

interface ColumnState {
  height: number;
  images: MasonryImage[];
}

export default function MasonryGallery() {
  const [visibleImages, setVisibleImages] = useState<ImageData[]>([]);
  const [loadedImages, setLoadedImages] = useState(new Set<number>());
  const [columns, setColumns] = useState<ColumnState[]>([]);
  const [columnCount, setColumnCount] = useState(4);
  const observerRef = useRef<IntersectionObserver>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine column count based on container width
  useEffect(() => {
    const updateColumnCount = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width < 768) setColumnCount(2); // Mobile - 2 columns
      else if (width < 1024) setColumnCount(3); // Tablet - 3 columns
      else setColumnCount(4); // Desktop - 4 columns
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  // Initialize empty columns
  useEffect(() => {
    setColumns(Array(columnCount).fill(null).map(() => ({ height: 0, images: [] })));
  }, [columnCount]);

  // Smart initial placement with offset logic
  const createSmartLayout = useCallback((images: ImageData[]) => {
    const newColumns: ColumnState[] = Array(columnCount).fill(null).map(() => ({ height: 0, images: [] }));
    
    images.forEach((image, index) => {
      const isHorizontal = image.width > image.height;
      const aspectRatio = image.width / image.height;
      
      // Phase 1: Smart initial placement (first 8 images)
      if (index < 8) {
        const targetColumn = index % columnCount;
        
        // Apply cropping to columns 1 and 3 (0-indexed) for offset
        // Skip cropping for horizontal images or extreme aspect ratios
        const shouldCrop = (targetColumn === 1 || targetColumn === 3) && 
                          !isHorizontal && 
                          aspectRatio < 2 && aspectRatio > 0.5;
        
        const cropPercentage = shouldCrop ? 0.12 : 0; // 12% crop
        
        const masonryImage: MasonryImage = {
          ...image,
          shouldCrop,
          cropPercentage,
          columnIndex: targetColumn
        };
        
        // Calculate display height (accounting for crop)
        const displayHeight = shouldCrop ? image.height * (1 - cropPercentage) : image.height;
        
        newColumns[targetColumn].images.push(masonryImage);
        newColumns[targetColumn].height += displayHeight;
      } 
      // Phase 2: Normal shortest-column placement
      else {
        const shortestColumnIndex = newColumns.reduce((minIndex, column, currentIndex) => 
          column.height < newColumns[minIndex].height ? currentIndex : minIndex, 0
        );
        
        const masonryImage: MasonryImage = {
          ...image,
          shouldCrop: false,
          cropPercentage: 0,
          columnIndex: shortestColumnIndex
        };
        
        newColumns[shortestColumnIndex].images.push(masonryImage);
        newColumns[shortestColumnIndex].height += image.height;
      }
    });
    
    return newColumns;
  }, [columnCount]);

  // Initial load: 30 images with smart layout
  useEffect(() => {
    if (columnCount > 0) {
      const initialImages = localImages.slice(0, 30);
      setVisibleImages(initialImages);
      setColumns(createSmartLayout(initialImages));
    }
  }, [columnCount, createSmartLayout]);

  // Load next 70 images when user scrolls
  useEffect(() => {
    if (visibleImages.length === 30) {
      const timer = setTimeout(() => {
        const newImages = localImages.slice(0, 100);
        setVisibleImages(newImages);
        setColumns(createSmartLayout(newImages));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visibleImages, createSmartLayout]);

  // Load remaining images on scroll
  const loadMoreImages = useCallback(() => {
    if (visibleImages.length === 100 && visibleImages.length < localImages.length) {
      setVisibleImages(localImages);
      setColumns(createSmartLayout(localImages));
    }
  }, [visibleImages, createSmartLayout]);

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

  // Calculate column width as percentage
  const columnWidthPercent = 100 / columnCount;
  const spacing = 12; // px

  return (
    <div className="p-3" ref={containerRef}>
      <div className="flex gap-3" style={{ alignItems: 'flex-start' }}>
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            style={{
              width: `calc(${columnWidthPercent}% - ${spacing * (columnCount - 1) / columnCount}px)`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${spacing}px`
            }}
          >
            {column.images.map((image) => {
              const displayHeight = image.shouldCrop 
                ? image.height * (1 - image.cropPercentage)
                : image.height;
              
              const displayWidth = image.width;
              const aspectRatio = displayWidth / displayHeight;
              
              return (
                <div 
                  key={image.id} 
                  className="relative overflow-hidden rounded"
                  style={{
                    aspectRatio: aspectRatio.toString(),
                    backgroundColor: loadedImages.has(image.id) ? 'transparent' : '#f3f4f6',
                  }}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full"
                    loading={image.id <= 30 ? "eager" : "lazy"}
                    onLoad={() => handleImageLoad(image.id)}
                    style={{
                      opacity: loadedImages.has(image.id) ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      objectFit: 'cover',
                      objectPosition: image.shouldCrop ? 'center center' : 'center'
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {visibleImages.length === 100 && visibleImages.length < localImages.length && (
        <div ref={sentinelRef} className="h-1" />
      )}
    </div>
  );
}