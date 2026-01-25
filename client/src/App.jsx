import { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout';
import SearchBar from './components/SearchBar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import Carousel from './components/Carousel';
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { showLoginPage, closeLoginPage, loginMode, user, isLoggedIn, openLoginPage, loginSource } = useAuth();

  const isAdminLoginRoute = useMemo(() => window.location.pathname === '/admin-login', []);
  const isAdminRoute = useMemo(() => window.location.pathname === '/admin', []);

  const handleProductClick = (product) => {
    if (!isLoggedIn) {
      openLoginPage('login', 'product-click');
    } else {
      setSelectedProduct(product);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load products');
        }
        setProducts(data.products || []);
      } catch (err) {
        setProductsError(err.message || 'Failed to load products');
      }
    };

    fetchProducts();
  }, [API_URL]);

  // Admin login page route (public, but checks for existing admin login)
  if (isAdminLoginRoute) {
    return <AdminLoginPage />;
  }

  // Admin dashboard route (protected - only admins)
  if (isAdminRoute) {
    if (!isLoggedIn || !user?.isAdmin) {
      // Redirect to admin login if not authenticated
      window.location.href = '/admin-login';
      return null;
    }
    return <AdminLogin />;
  }

  if (showLoginPage) {
    return <Login onBackClick={closeLoginPage} initialMode={loginMode} loginSource={loginSource} />;
  }

  return (
    <Layout>
      {/* Search Bar Section */}
      <SearchBar onSearch={() => {}} />

      {/* Products Section */}
      <div className="w-full p-4 md:p-8 bg-white rounded-2xl mt-4 md:mt-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-850">Products</h2>
            <p className="text-neutral-850 text-sm mt-1">Discover our amazing collection</p>
          </div>
          <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
            <p className="text-neutral-300 text-sm">
              Showing <span className="font-bold text-neutral-200">{products.length}</span> product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {productsError && (
          <div className="w-full bg-red-950/30 border border-red-800 text-red-400 rounded-lg p-4 mb-4">
            {productsError}
          </div>
        )}

        {products.length === 0 ? (
          <div className="w-full bg-neutral-800/50 rounded-xl border-2 border-dashed border-neutral-700 p-8 md:p-16 flex flex-col items-center justify-center min-h-80">
            <div className="mb-4">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-neutral-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-neutral-300 text-lg md:text-xl font-semibold text-center">No products available</p>
            <p className="text-neutral-400 text-sm md:text-base mt-2 text-center">Check back soon for our amazing collection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div 
                key={index} 
                className="bg-neutral-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 overflow-hidden group cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4 bg-neutral-900 h-72 md:h-80">
                  <img 
                    src={product.image || (product.images && product.images[0])} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-neutral-850 text-xs md:text-[15px] font-bold line-clamp-2 group-hover:text-neutral-900 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between border-neutral-300">
                    <p className="text-neutral-900 text-m md:text-m">Price: ${product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-2xl font-bold text-neutral-100">Product Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-neutral-400 hover:text-neutral-100 transition text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 p-6 overflow-y-auto max-h-[calc(95vh-100px)] h-[calc(95vh-100px)]">
              {/* Carousel on Left */}
              <div className="rounded-xl overflow-hidden bg-neutral-800 h-full">
                <Carousel
                  images={selectedProduct.images?.length
                    ? selectedProduct.images
                    : [selectedProduct.image].filter(Boolean)
                  }
                  showControls
                  className="h-full"
                  useDefaultSizing={false}
                  enableZoom={true}
                />
              </div>

              {/* Details on Right */}
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-neutral-400 text-sm mb-2">Product Name</p>
                  <p className="text-2xl font-bold text-neutral-100">{selectedProduct.name}</p>
                </div>

                <div>
                  <p className="text-neutral-400 text-sm mb-2">Price</p>
                  <p className="text-2xl font-bold text-neutral-200">${selectedProduct.price}</p>
                </div>

                <div>
                  <p className="text-neutral-400 text-sm mb-2">Details</p>
                  <p className="text-neutral-100 whitespace-pre-line text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-neutral-100 transition font-semibold"
                  >
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;