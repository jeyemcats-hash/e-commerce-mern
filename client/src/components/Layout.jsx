import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import NavigationBar from './navbar';
import Carousel from './Carousel';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const isSmall = window.innerWidth < 768;
        setIsSmallScreen(isSmall);
        if (isSmall && isSidebarOpen) {
          setIsSidebarOpen(false);
        } else if (!isSmall && !isSidebarOpen) {
          setIsSidebarOpen(true);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <NavigationBar />

      <div className="flex pt-16 w-full flex-1 overflow-hidden">
        <div className={`flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto transition-all duration-500 ease-in-out ${isSidebarOpen && !isSmallScreen ? 'md:ml-64' : 'ml-0'}`}>
          <Carousel />
          {children}
          <button
            onClick={toggleSidebar}
            className="fixed top-20 left-4 z-20 p-2 rounded-lg bg-neutral-950 hover:bg-neutral-700 text-white transition-all duration-300"
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <Sidebar isOpen={isSidebarOpen} />
        {isSidebarOpen && isSmallScreen && (
          <div
            className="fixed inset-0 bg-black/50 z-5 top-16 transition-opacity duration-300 ease-in-out"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Layout;