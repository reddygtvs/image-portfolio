import MasonryGallery from './components/MasonryGallery';

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-start p-2">
        <div className="bg-black px-4 py-2 rounded">
          <h1 className="text-3xl font-inter font-bold text-white uppercase tracking-widest">
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