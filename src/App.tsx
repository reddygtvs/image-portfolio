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
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md flex items-center justify-between ${isMobile ? 'px-3 pt-2 pb-2' : 'px-5 pt-3 pb-3'}`}>
        <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-inter font-bold text-white uppercase tracking-widest m-0`}>
          TUSHAR REDDY<span className="bounce-favicon">.</span>
        </h1>
        <div className={`${isMobile ? 'text-base' : 'text-lg'} font-mono font-light text-white flex items-center justify-end gap-2`}>
          <span className="flex items-center gap-1">Inquiries? Contact
            {/* <div className="flex items-center -space-x-3" style={{ transform: 'translateY(1px)' }}>
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/></svg>
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/></svg>
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div> */}
          </span>
          <a 
            href="https://instagram.com/tushxrt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:scale-110 active:scale-95 transition-all duration-100"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
              alt="Instagram"
              className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}
            />
          </a>
        </div>
      </header>
      
      {/* Gallery */}
      <div className={`${isMobile ? 'pt-12' : 'pt-15'}`}>
        <MasonryGallery />
      </div>
    </div>
  );
}

export default App;