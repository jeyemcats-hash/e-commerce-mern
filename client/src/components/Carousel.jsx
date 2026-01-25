import { useState, useEffect } from 'react';
import hiphopOne from '../assets/images/Hiphop.jfif';
import hiphopTwo from '../assets/images/Hiphop2.jfif';
import hiphopThree from '../assets/images/Hiphop1.jpg';

function Carousel({ images = [], showControls = true, className = '', useDefaultSizing = true, enableZoom = false }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverButtons, setIsMouseOverButtons] = useState(false);

  // Default carousel images if none provided
  const carouselImages = images.length > 0 ? images : [hiphopOne, hiphopTwo, hiphopThree];

  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [carouselImages.length, isAutoPlay]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
    setIsAutoPlay(false);
  };

  const resumeAutoPlay = () => {
    setIsAutoPlay(true);
  };

  const handleMouseMove = (e) => {
    if (!enableZoom) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
    // Store both relative and absolute positions
    setMousePosition({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top,
      absoluteX: e.clientX,
      absoluteY: e.clientY
    });
    
    // Disable zoom if over buttons
    if (isMouseOverButtons) {
      setShowZoom(false);
    } else {
      setShowZoom(true);
    }
  };

  const handleMouseEnter = () => {
    if (enableZoom) {
      setShowZoom(true);
      setIsAutoPlay(false);
    }
  };

  const handleMouseLeave = () => {
    if (enableZoom) {
      setShowZoom(false);
    }
    resumeAutoPlay();
  };

  const sizing = useDefaultSizing
    ? 'w-full h-80 sm:h-96 md:h-112 lg:h-128 mb-8'
    : 'w-full h-full';

  return (
    <div className={`${sizing} group relative z-0 ${className}`} onMouseLeave={handleMouseLeave}>
      {/* Carousel Container */}
      <div 
        className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl z-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
      >
        {/* Slides */}
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        ))}

        {/* Navigation Buttons */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-between px-4 md:px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none overflow-hidden">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              onMouseEnter={() => {
                setIsAutoPlay(false);
                setIsMouseOverButtons(true);
                setShowZoom(false);
              }}
              onMouseLeave={() => setIsMouseOverButtons(false)}
              className="bg-linear-to-r from-neutral-800 to-neutral-800 hover:from-neutral-500 hover:to-neutral-500 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-neutral-500/50 hover:scale-105 active:scale-95 pointer-events-auto shrink-0"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              onMouseEnter={() => {
                setIsAutoPlay(false);
                setIsMouseOverButtons(true);
                setShowZoom(false);
              }}
              onMouseLeave={() => setIsMouseOverButtons(false)}
              className="bg-linear-to-r from-neutral-800 to-neutral-800 hover:from-neutral-500 hover:to-neutral-500 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-neutral-500/50 hover:scale-105 active:scale-95 pointer-events-auto shrink-0"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Slide Counter */}
        {/* Removed */}

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              onMouseEnter={() => setIsAutoPlay(false)}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? 'bg-linear-to-r from-neutral-400 to-neutral-300 w-8 h-3 shadow-lg shadow-neutral-500/50'
                  : 'bg-white/40 hover:bg-white/70 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Magnifying Glass Effect - Outside carousel to avoid clipping */}
      {enableZoom && showZoom && mousePosition.absoluteX && carouselImages[currentSlide] && (
        <div
          className="fixed w-56 h-56 border-4 border-white rounded-full shadow-2xl pointer-events-none z-[100] overflow-hidden"
          style={{
            left: `${mousePosition.absoluteX}px`,
            top: `${mousePosition.absoluteY}px`,
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url('${carouselImages[currentSlide]}')`,
            backgroundSize: '500% 500%',
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 ring-4 ring-white/50 rounded-full pointer-events-none"></div>
        </div>
      )}
    </div>
  );
}

export default Carousel;
