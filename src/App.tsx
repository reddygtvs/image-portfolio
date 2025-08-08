import { useState, useEffect } from "react";
import MasonryGallery from "./components/MasonryGallery";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md flex items-center justify-between ${
          isMobile ? "px-3 pt-2 pb-2" : "px-5 pt-3 pb-3"
        }`}
      >
        <h1
          className={`${
            isMobile ? "text-lg" : "text-2xl"
          } font-inter font-bold text-white uppercase tracking-widest m-0`}
        >
          TUSHAR REDDY<span className="bounce-favicon">.</span>
        </h1>
        <div
          className={`${
            isMobile ? "text-base" : "text-lg"
          } font-inter font-bold text-white flex items-center justify-end gap-2`}
        >
          <span className="flex items-center gap-1">
            CONTACT
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
            aria-label="Instagram profile of Tushar"
          >
            <svg
              className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="Visit Instagram profile"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <span className="bounce-favicon">.</span>
        </div>
      </header>

      {/* Gallery */}
      <div className={`${isMobile ? "pt-12" : "pt-15"}`}>
        <MasonryGallery />
      </div>
    </div>
  );
}

export default App;
