import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';

const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports',
  'Toys',
  'Food',
  'Other',
];

function AdminLogin() {
  const { user, isLoggedIn, logout } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    imagesText: '',
  });
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [products, setProducts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedCover, setSelectedCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Redirect non-admins away from admin dashboard
  useEffect(() => {
    if (isLoggedIn && !user?.isAdmin) {
      console.log('Non-admin logged in on admin dashboard - redirecting to home');
      window.location.href = '/';
    }
  }, [isLoggedIn, user?.isAdmin]);

  const handleLogout = () => {
    logout();
    window.location.href = '/admin-login';
  };

  const handleImagesSelect = (e) => {
    const newFiles = Array.from(e.target.files || []);
    // Append new files to existing ones instead of replacing
    setSelectedImages((prev) => [...prev, ...newFiles]);

    // Generate previews for new files
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Clear input so user can select same file again if needed
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return [];

    const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
    console.log('uploadImages - token exists:', !!token);
    
    if (!token) {
      throw new Error('Auth token missing - please log in again');
    }

    setUploadingImages(true);
    try {
      const formData = new FormData();

      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetch(`${API_URL}/api/upload/multiple`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload images');
      }

      // Convert relative URLs to absolute URLs
      return data.urls.map((url) => `${API_URL}${url}`);
    } catch (err) {
      throw new Error('Image upload failed: ' + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const uploadCoverImage = async (file) => {
    if (!file) return '';

    const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
    console.log('uploadCoverImage - token exists:', !!token);
    
    if (!token) {
      throw new Error('Auth token missing - please log in again');
    }

    setUploadingImages(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload cover image');
      }

      // Convert relative URL to absolute URL
      return `${API_URL}${data.url}`;
    } catch (err) {
      throw new Error('Cover image upload failed: ' + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
      console.log('Deleting product - Current user:', user?.name, 'isAdmin:', user?.isAdmin);
      console.log('Using token:', token?.substring(0, 20) + '...');
      
      if (!token) {
        throw new Error('Auth token missing - please log in as admin again');
      }
      
      if (!user?.isAdmin) {
        throw new Error('You must be logged in as an admin to delete products');
      }

      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      // Remove product from local state
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setExpandedId(null);
    } catch (err) {
      alert('Error deleting product: ' + (err.message || 'Unknown error'));
    }
  };

  const openDeleteConfirm = (productId) => {
    setDeleteTargetId(productId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) {
      setShowDeleteConfirm(false);
      return;
    }

    await handleDeleteProduct(deleteTargetId);
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitState({ status: 'submitting', message: '' });

    try {
      const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
      console.log('Creating product - Current user:', user?.name, 'isAdmin:', user?.isAdmin);
      console.log('Using token:', token?.substring(0, 20) + '...');
      console.log('Token is', token ? 'PRESENT' : 'MISSING');
      
      if (!token) {
        throw new Error('Auth token missing - please log in as admin again');
      }
      
      if (!user?.isAdmin) {
        throw new Error('You must be logged in as an admin to create products');
      }

      // Upload product images
      let imageUrls = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(selectedImages);
      }

      // Upload cover image
      let coverUrl = '';
      if (selectedCover) {
        coverUrl = await uploadCoverImage(selectedCover);
      }

      // Use first image as fallback cover if not specified
      const finalCover = coverUrl || imageUrls[0] || form.image;

      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: 'Other',
          stock: 0,
          image: finalCover,
          images: imageUrls,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      setProducts((prev) => [data.product, ...prev]);
      setSubmitState({ status: 'success', message: 'Product created successfully' });
      setForm({ name: '', description: '', price: '', image: '', imagesText: '' });
      setSelectedImages([]);
      setImagePreviews([]);
      setSelectedCover(null);
      setCoverPreview('');
    } catch (err) {
      setSubmitState({ status: 'error', message: err.message || 'Failed to create product' });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products');
      }
      setProducts(data.products || []);
    } catch (err) {
      // Silent fail for admin view; keep list empty
      setProducts([]);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.isAdmin) {
      fetchProducts();
    }
  }, [isLoggedIn, user]);


  // This is admin-only dashboard, so can always post
  const canPost = true;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 p-4 sm:p-6 flex flex-col md:flex-col">
        <div className="mb-6 md:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-black to-neutral-700 rounded-lg flex items-center justify-center mb-3">
            <span className="text-white font-bold text-base sm:text-lg">H</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold">Admin Panel</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 truncate">{user?.name}</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-2 flex flex-row md:flex-col gap-2 md:gap-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 md:flex-none md:w-full text-center md:text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 md:flex-none md:w-full text-center md:text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 md:flex-none md:w-full text-center md:text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 md:flex-none md:w-full text-center md:text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 transition-all font-medium"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold">Products</h2>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-semibold transition"
              >
                {showForm ? 'Hide form' : 'Add product'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(420px,520px)_minmax(520px,1fr)] gap-6">
              <div>
                {showForm && (
                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-neutral-300">Product name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Product name"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-neutral-300">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs sm:text-sm text-neutral-300">Product detail</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                    placeholder="Write a short description"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs sm:text-sm text-neutral-300">Product Images (Multiple)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagesSelect}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-300 text-sm"
                  />
                  <p className="text-xs text-neutral-400">Select one or multiple images, then select again to add more</p>
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2 sm:mt-3 p-2 sm:p-3 bg-neutral-800 rounded-lg">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-neutral-700">
                            <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                          <p className="text-xs text-neutral-400 mt-1 text-center">{idx + 1}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs sm:text-sm text-neutral-300">Cover Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-300 text-sm"
                  />
                  {coverPreview && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-neutral-700">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {submitState.status !== 'idle' && (
                  <p className={`text-xs sm:text-sm sm:col-span-2 ${submitState.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {submitState.message}
                  </p>
                )}

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitState.status === 'submitting' || uploadingImages}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-semibold transition disabled:opacity-60 text-sm sm:text-base"
                  >
                    {uploadingImages
                      ? 'Uploading images...'
                      : submitState.status === 'submitting'
                        ? 'Posting...'
                        : 'Post Product'}
                  </button>
                </div>
              </form>
            )}
              </div>

              <div>
                <div className="max-h-[70vh] overflow-y-auto pr-2 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 sm:p-4 shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {products.length === 0 && (
                    <div className="p-4 sm:p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-300 text-sm">
                      No products yet. Add your first product to make it visible to shoppers.
                    </div>
                  )}

                  {products.map((product) => {
                // Use cover image as the main preview
                const cover = product.image;
                // Gallery includes all product images, or cover as fallback
                const gallery = product.images && product.images.length
                  ? product.images
                  : product.image
                    ? [product.image]
                    : [];
                const isExpanded = expandedId === product._id;

                return (
                  <div key={product._id || product.name} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4 items-center">
                      <div className="rounded-lg overflow-hidden bg-neutral-800/70 w-24 h-16 sm:w-28 sm:h-20 flex items-center justify-center shrink-0">
                        {cover ? (
                          <img src={cover} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-neutral-500 text-xs">No image</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-neutral-100 truncate">{product.name}</p>
                        <p className="text-blue-400 text-xs sm:text-sm">${product.price}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : product._id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-blue-500 hover:text-blue-300 transition"
                          >
                            {isExpanded ? 'Close' : 'View more'}
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(product._id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:border-red-500 hover:bg-red-600/10 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {expandedId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-6xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800">
                <h2 className="text-lg sm:text-2xl font-bold text-neutral-100">Product Details</h2>
                <button
                  onClick={() => setExpandedId(null)}
                  className="text-neutral-400 hover:text-neutral-100 transition text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] h-[calc(95vh-100px)]">
                {/* Carousel on Left */}
                <div className="rounded-xl overflow-hidden bg-neutral-800 h-64 sm:h-80 lg:h-full">
                  <Carousel
                    images={products.find((p) => p._id === expandedId)?.images?.length
                      ? products.find((p) => p._id === expandedId).images
                      : [products.find((p) => p._id === expandedId)?.image].filter(Boolean)
                    }
                    showControls
                    className="h-full"
                    useDefaultSizing={false}
                  />
                </div>

                {/* Details on Right */}
                <div className="flex flex-col gap-4 text-sm sm:text-base">
                  <div>
                    <p className="text-neutral-400 text-xs sm:text-sm mb-2">Product Name</p>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-100">{products.find((p) => p._id === expandedId)?.name}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400 text-xs sm:text-sm mb-2">Price</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-400">${products.find((p) => p._id === expandedId)?.price}</p>
                  </div>

                  <div>
                    <p className="text-neutral-400 text-xs sm:text-sm mb-2">Details</p>
                    <p className="text-neutral-100 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                      {products.find((p) => p._id === expandedId)?.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => openDeleteConfirm(expandedId)}
                      className="w-full px-4 py-2 sm:py-3 rounded-lg bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600/30 transition font-semibold text-sm sm:text-base"
                    >
                      Delete Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Orders</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sm:p-8 text-center">
              <p className="text-neutral-400 text-sm sm:text-base">No orders yet</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sm:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="pb-4 sm:pb-6 border-b border-neutral-700">
                  <p className="text-xs sm:text-sm text-neutral-400">Admin Information</p>
                  <p className="text-base sm:text-lg font-semibold mt-2">{user?.name}</p>
                  <p className="text-neutral-400 text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-neutral-400">Account Status</p>
                  <p className="text-base sm:text-lg font-semibold mt-2 text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-neutral-100">Delete Product</h3>
              <p className="text-sm text-neutral-400 mt-2">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-200 hover:border-neutral-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600/20 border border-red-600 text-red-300 hover:bg-red-600/30 transition font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
