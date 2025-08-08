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

const INITIAL_LOAD_COUNT = 15;
const BATCH_SIZE = 15;

export default function MasonryGallery() {
  const [visibleImages, setVisibleImages] = useState<ImageData[]>([]);
  const [loadedImages, setLoadedImages] = useState(new Set<number>());
  const [columns, setColumns] = useState<ColumnState[]>([]);
  const [columnCount, setColumnCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine column count based on container width
  useEffect(() => {
    const updateColumnCount = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width < 768) setColumnCount(3); // Mobile - 3 columns
      else if (width < 1024) setColumnCount(4); // Tablet - 4 columns
      else setColumnCount(5); // Desktop - 5 columns
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
      
      // Phase 1: Smart initial placement
      if (index < Math.max(8, columnCount * 2)) {
        const targetColumn = index % columnCount;
        
        const shouldCrop = (targetColumn % 2 === 1) && 
                          !isHorizontal && 
                          aspectRatio < 2 && aspectRatio > 0.5;
        
        const cropPercentage = shouldCrop ? 0.12 : 0;
        
        const masonryImage: MasonryImage = {
          ...image,
          shouldCrop,
          cropPercentage,
          columnIndex: targetColumn
        };
        
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

  // Load images in batches
  useEffect(() => {
    if (columnCount > 0) {
      // Initial load
      const initialImages = localImages.slice(0, INITIAL_LOAD_COUNT);
      setVisibleImages(initialImages);
      setColumns(createSmartLayout(initialImages));

      // Sequentially load the rest
      let currentIndex = INITIAL_LOAD_COUNT;
      const intervalId = setInterval(() => {
        if (currentIndex >= localImages.length) {
          clearInterval(intervalId);
          return;
        }
        const nextBatch = localImages.slice(0, currentIndex + BATCH_SIZE);
        setVisibleImages(nextBatch);
        setColumns(createSmartLayout(nextBatch));
        currentIndex += BATCH_SIZE;
      }, 100); // 100ms delay between batches

      return () => clearInterval(intervalId);
    }
  }, [columnCount, createSmartLayout]);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  const columnWidthPercent = 100 / columnCount;
  const spacing = columnCount === 3 ? 12 : 20;

  return (
    <div className={`${columnCount === 3 ? 'p-3' : 'p-5'}`} ref={containerRef}>
      <div className={`flex ${columnCount === 3 ? 'gap-3' : 'gap-5'}`} style={{ alignItems: 'flex-start' }}>
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
                    loading={image.id <= INITIAL_LOAD_COUNT ? "eager" : "lazy"}
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
    </div>
  );
}