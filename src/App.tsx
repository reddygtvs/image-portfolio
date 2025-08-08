import { useState, useEffect } from 'react';
import MasonryGallery from './components/MasonryGallery';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className={`flex items-center justify-start ${isMobile ? 'px-3 pt-3' : 'px-5 pt-5'} pb-1`}>
        <div className={`bg-white ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} rounded`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-inter font-bold text-black uppercase tracking-widest`}>
            TUSHAR REDDY<span className="bounce-favicon">.</span>
          </h1>
        </div>
      </header>
      
      {/* Gallery */}
      <MasonryGallery />
    </div>
  );
}

export default App;