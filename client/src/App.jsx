import { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout';
import SearchBar from './components/SearchBar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import UserOrders from './pages/UserOrders.jsx';
import UserCart from './pages/UserCart.jsx';
import UserFavorites from './pages/UserFavorites.jsx';
import UserSettings from './pages/UserSettings.jsx';
import Carousel from './components/Carousel';
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsError, setProductsError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favoriteItems');
    return stored ? JSON.parse(stored) : [];
  });
  const [animatingHeartId, setAnimatingHeartId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    category: '',
    priceRange: '',
    rating: ''
  });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { showLoginPage, closeLoginPage, loginMode, user, isLoggedIn, openLoginPage, loginSource } = useAuth();

  const isAdminLoginRoute = useMemo(() => window.location.pathname === '/admin-login', []);
  const isAdminRoute = useMemo(() => window.location.pathname === '/admin', []);
  const isOrdersRoute = useMemo(() => window.location.pathname === '/orders', []);
  const isCartRoute = useMemo(() => window.location.pathname === '/cart', []);
  const isFavoritesRoute = useMemo(() => window.location.pathname === '/favorites', []);
  const isSettingsRoute = useMemo(() => window.location.pathname === '/settings', []);

  const handleProductClick = (product) => {
    if (!isLoggedIn) {
      openLoginPage('login', 'product-click');
    } else {
      setSelectedProduct(product);
    }
  };

  const addToCart = (product) => {
    const stored = localStorage.getItem('cartItems');
    const existing = stored ? JSON.parse(stored) : [];
    const id = product._id || product.id || product.name;
    const index = existing.findIndex((item) => item.id === id);

    if (index >= 0) {
      existing[index].quantity += 1;
    } else {
      existing.push({
        id,
        name: product.name,
        price: Number(product.price),
        image: product.image || (product.images && product.images[0]) || '',
        quantity: 1,
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(existing));
    setCartMessage('Added to cart');
    setTimeout(() => setCartMessage(''), 1500);
  };

  const addToFavorites = (product) => {
    const id = product._id || product.id || product.name;
    const index = favorites.findIndex((item) => item.id === id);

    let updated;
    if (index >= 0) {
      // Remove from favorites
      updated = favorites.filter((_, i) => i !== index);
    } else {
      // Add to favorites
      updated = [...favorites, {
        id,
        name: product.name,
        price: Number(product.price),
        image: product.image || (product.images && product.images[0]) || '',
      }];
    }

    setFavorites(updated);
    localStorage.setItem('favoriteItems', JSON.stringify(updated));
    
    // Trigger animation
    setAnimatingHeartId(id);
    setTimeout(() => setAnimatingHeartId(null), 600);
  };

  const isFavorited = (product) => {
    const id = product._id || product.id || product.name;
    return favorites.some((item) => item.id === id);
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
        setFilteredProducts(data.products || []);
      } catch (err) {
        setProductsError(err.message || 'Failed to load products');
      }
    };

    fetchProducts();
  }, [API_URL]);

  // Filter and search effect
  useEffect(() => {
    let results = products;

    // Search filter
    if (searchQuery.trim()) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filterCriteria.category) {
      results = results.filter(product => product.category === filterCriteria.category);
    }

    // Price range filter
    if (filterCriteria.priceRange) {
      results = results.filter(product => {
        const price = Number(product.price);
        switch (filterCriteria.priceRange) {
          case '0-750':
            return price >= 0 && price <= 750;
          case '750-1500':
            return price > 750 && price <= 1500;
          case '1500-2500':
            return price > 1500 && price <= 2500;
          case '2500+':
            return price > 2500;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (filterCriteria.rating) {
      results = results.filter(product => {
        const rating = Number(product.rating) || 0;
        return rating >= Number(filterCriteria.rating);
      });
    }

    setFilteredProducts(results);
  }, [searchQuery, filterCriteria, products]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters) => {
    setFilterCriteria(filters);
  };

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

  if (isOrdersRoute) {
    return (
      <Layout>
        <UserOrders />
      </Layout>
    );
  }

  if (isCartRoute) {
    return (
      <Layout>
        <UserCart />
      </Layout>
    );
  }

  if (isFavoritesRoute) {
    return (
      <Layout>
        <UserFavorites />
      </Layout>
    );
  }

  if (isSettingsRoute) {
    return (
      <Layout>
        <UserSettings />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Search Bar Section */}
      <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />

      {/* Products Section */}
      <div className="w-full p-4 md:p-8 bg-white rounded-lg mt-4 md:mt-6 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-950">Products</h2>
            <p className="text-neutral-600 text-sm mt-1 font-normal">Discover our collection</p>
          </div>
          <div className="px-4 py-2 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-neutral-700 text-sm font-normal">
              Showing <span className="text-neutral-900">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {productsError && (
          <div className="w-full bg-red-950/30 border border-red-800 text-red-400 rounded-lg p-4 mb-4">
            {productsError}
          </div>
        )}

        {products.length === 0 ? (
          <div className="w-full bg-neutral-50 rounded-lg border border-neutral-200 p-8 md:p-16 flex flex-col items-center justify-center min-h-80">
            <div className="mb-4">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-neutral-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-neutral-900 text-lg md:text-xl font-normal text-center">No products available</p>
            <p className="text-neutral-500 text-sm md:text-base mt-2 text-center font-normal">Check back soon for our collection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 p-0 overflow-hidden group"
              >
                <div className="relative overflow-hidden rounded-t-lg bg-neutral-900 h-56 md:h-64 cursor-pointer" onClick={() => handleProductClick(product)}>
                  <img 
                    src={product.image || (product.images && product.images[0])} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/0 opacity-0 group-hover:bg-black/5 hover:opacity-100 transition-all duration-300"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(product);
                    }}
                    className={`absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg ${animatingHeartId === (product._id || product.id || product.name) ? 'animate-bounce-heart' : 'hover:scale-110 transition-transform duration-200'}`}
                  >
                    {isFavorited(product) ? (
                      <svg className="w-6 h-6 text-red-500 fill-red-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-neutral-400 hover:text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="space-y-1 cursor-pointer p-3" onClick={() => handleProductClick(product)}>
                  <h3 className="font-normal text-neutral-900 text-xs line-clamp-2 group-hover:text-black transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between">
                    <p className="text-neutral-700 text-xs font-normal">Price: ${product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-neutral-200 w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-normal text-neutral-950">Product Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-neutral-500 hover:text-neutral-900 transition text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] h-[calc(95vh-100px)]">
              {/* Carousel on Left */}
              <div className="rounded-lg overflow-hidden bg-neutral-900 h-90 sm:h-96 lg:h-full">
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
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[40vh] sm:max-h-none">
                <div>
                  <p className="text-neutral-500 text-sm mb-2 font-normal">Product Name</p>
                  <p className="text-2xl font-normal text-neutral-950">{selectedProduct.name}</p>
                </div>

                <div>
                  <p className="text-neutral-500 text-sm mb-2 font-normal">Price</p>
                  <p className="text-2xl font-normal text-neutral-900">${selectedProduct.price}</p>
                </div>

                <div>
                  <p className="text-neutral-500 text-sm mb-2 font-normal">Details</p>
                  <p className="text-neutral-700 whitespace-pre-line text-sm leading-relaxed font-normal">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="mt-auto">
                  {cartMessage && (
                    <p className="text-sm text-green-600 mb-3 font-normal">{cartMessage}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      className="w-full px-4 py-3 rounded-lg bg-black hover:bg-neutral-800 border border-black text-white transition font-normal"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-full px-4 py-3 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-300 text-black transition font-normal"
                    >
                      Back to Products
                    </button>
                  </div>
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