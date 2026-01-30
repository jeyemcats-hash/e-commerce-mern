import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';

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
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderStatusOptions] = useState(['Processing', 'Shipped', 'Delivered', 'Cancelled']);
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

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products');
      }
      setProducts(data.products || []);
    } catch {
      // Silent fail for admin view; keep list empty
      setProducts([]);
    }
  }, [API_URL]);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Auth token missing - please log in again');
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders');
      }

      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [API_URL]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Auth token missing - please log in again');
      }

      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      // Update the order in the list
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      // Update the selected order if it's open
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      setOrdersError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isLoggedIn, user, fetchProducts, fetchOrders]);


  // This is admin-only dashboard, so can always post

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-56 bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-200 p-4 sm:p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-neutral-900">Admin</h1>
          <p className="text-xs text-neutral-500 mt-1 truncate">{user?.name}</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-0 flex flex-row md:flex-col">
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              activeTab === 'products'
                ? 'border-l-2 border-black bg-black text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              activeTab === 'orders'
                ? 'border-l-2 border-black bg-black text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-l-2 border-black bg-black text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 md:p-8 bg-white">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-neutral-900">Products</h2>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors"
              >
                {showForm ? 'Cancel' : 'Add Product'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(420px,520px)_minmax(520px,1fr)] gap-6">
              <div>
                {showForm && (
                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-neutral-700">Product name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-neutral-300 bg-white focus:outline-none focus:border-black text-sm text-neutral-900"
                    placeholder="Product name"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-neutral-700">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-neutral-300 bg-white focus:outline-none focus:border-black text-sm text-neutral-900"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-sm text-neutral-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-neutral-300 bg-white focus:outline-none focus:border-black min-h-25 text-sm text-neutral-900"
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
                    className="w-full px-3 py-2 rounded border border-neutral-300 bg-white focus:outline-none focus:border-black text-sm text-neutral-900"
                  />
                  <p className="text-xs text-neutral-500">Select multiple images, then select again to add more</p>
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2 p-2 bg-neutral-100 rounded">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <div className="w-16 h-16 rounded overflow-hidden border border-neutral-300">
                            <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                          <p className="text-xs text-neutral-600 mt-1 text-center">{idx + 1}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-sm text-neutral-700">Cover Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="w-full px-3 py-2 rounded border border-neutral-300 bg-white focus:outline-none focus:border-black text-sm text-neutral-900"
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
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 font-semibold transition disabled:opacity-60 text-sm text-black"
                    style={{ border: '0.5px solid', borderColor: '#999999', transition: 'border-color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#000000'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#999999'}
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
                <div className="max-h-[70vh] overflow-y-auto pr-2 rounded border border-neutral-200 bg-white p-3 sm:p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {products.length === 0 && (
                    <div className="p-4 sm:p-6 rounded border border-neutral-200 bg-neutral-50 text-neutral-700 text-sm">
                      No products yet. Add your first product to make it visible to shoppers.
                    </div>
                  )}

                  {products.map((product) => {
                // Use cover image as the main preview
                const cover = product.image;
                const isExpanded = expandedId === product._id;

                return (
                  <div key={product._id || product.name} className="rounded border border-neutral-200 bg-white p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4 items-center">
                      <div className="rounded overflow-hidden bg-neutral-100 w-24 h-16 sm:w-28 sm:h-20 flex items-center justify-center shrink-0">
                        {cover ? (
                          <img src={cover} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-neutral-500 text-xs">No image</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-neutral-900 truncate">{product.name}</p>
                        <p className="text-neutral-700 text-xs sm:text-sm">${product.price}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : product._id)}
                            className="text-xs px-3 py-1.5 rounded border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 transition"
                          >
                            {isExpanded ? 'Close' : 'View more'}
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(product._id)}
                            className="text-xs px-3 py-1.5 rounded border border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50 transition"
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
            <div className="bg-white rounded border border-neutral-200 w-full max-w-6xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200">
                <h2 className="text-lg sm:text-2xl font-bold text-neutral-900">Product Details</h2>
                <button
                  onClick={() => setExpandedId(null)}
                  className="text-neutral-500 hover:text-neutral-900 transition text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] h-[calc(95vh-100px)]">
                {/* Carousel on Left */}
                <div className="rounded overflow-hidden bg-neutral-100 h-64 sm:h-80 lg:h-full">
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
                    <p className="text-neutral-500 text-xs sm:text-sm mb-2 uppercase tracking-wide">Product Name</p>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900">{products.find((p) => p._id === expandedId)?.name}</p>
                  </div>

                  <div>
                    <p className="text-neutral-500 text-xs sm:text-sm mb-2 uppercase tracking-wide">Price</p>
                    <p className="text-lg sm:text-2xl font-bold text-neutral-900">${products.find((p) => p._id === expandedId)?.price}</p>
                  </div>

                  <div>
                    <p className="text-neutral-500 text-xs sm:text-sm mb-2 uppercase tracking-wide">Details</p>
                    <p className="text-neutral-700 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                      {products.find((p) => p._id === expandedId)?.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => openDeleteConfirm(expandedId)}
                      className="w-full px-4 py-2 sm:py-3 rounded bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 transition font-semibold text-sm sm:text-base"
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-neutral-900">Orders</h2>
              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {ordersLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {ordersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
                {ordersError}
              </div>
            )}

            {ordersLoading ? (
              <div className="bg-neutral-50 border border-neutral-200 rounded p-6 text-center">
                <p className="text-neutral-500 text-sm">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-neutral-50 border border-neutral-200 rounded p-6 text-center">
                <p className="text-neutral-500 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="px-4 py-3 text-left font-semibold text-neutral-900">Order ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-900">Customer</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-900">Products</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-900">Total</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-900">Payment</th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr 
                        key={order._id} 
                        onClick={() => setSelectedOrder(order)}
                        className="border-b border-neutral-200 hover:bg-neutral-50 transition cursor-pointer"
                      >
                        <td className="px-4 py-3 text-neutral-900 text-sm truncate font-mono">{order._id.slice(-8)}</td>
                        <td className="px-4 py-3 text-neutral-900">
                          <div>
                            <p className="font-medium text-sm">{order.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-neutral-500">{order.user?.email || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-900">
                          <div className="text-xs">
                            {order.orderItems.map((item, idx) => (
                              <p key={idx} className="text-neutral-700">
                                {item.name} x{item.quantity}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-900 font-semibold text-sm">
                          ₱{order.totalPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.orderStatus === 'Processing'
                              ? 'bg-neutral-200 text-neutral-800'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.orderStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : order.paymentStatus === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-700 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-neutral-900">Settings</h2>
            <div className="bg-neutral-50 border border-neutral-200 rounded p-6">
              <div className="space-y-6">
                <div className="pb-6 border-b border-neutral-200">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Admin Information</p>
                  <p className="text-lg font-semibold mt-3 text-neutral-900">{user?.name}</p>
                  <p className="text-neutral-600 text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Account Status</p>
                  <p className="text-lg font-semibold mt-3 text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded border border-neutral-200 w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-neutral-900">Delete Product</h3>
              <p className="text-sm text-neutral-600 mt-2">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded border border-neutral-300 text-neutral-900 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 transition font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-neutral-900 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Order ID</p>
                  <p className="font-mono text-sm text-neutral-900">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Order Date</p>
                  <p className="text-sm text-neutral-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Customer</p>
                  <p className="text-sm text-neutral-900 font-medium">{selectedOrder.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-neutral-600">{selectedOrder.user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Total Price</p>
                  <p className="text-lg font-semibold text-neutral-900">₱{selectedOrder.totalPrice?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {/* Products */}
              <div className="mb-6 pb-6 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900 mb-3">Products</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start bg-neutral-100 p-3 rounded">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-3 uppercase tracking-wide">Order Status</p>
                  <div className="flex flex-wrap gap-2">
                    {orderStatusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder._id, status)}
                        disabled={updatingOrderId === selectedOrder._id}
                        className={`px-3 py-2 rounded text-xs font-medium transition ${
                          selectedOrder.orderStatus === status
                            ? 'bg-black text-white'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        } ${updatingOrderId === selectedOrder._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-3">Payment Status</p>
                  <div>
                    <span className={`inline-block px-3 py-2 rounded-full text-xs font-medium ${
                      selectedOrder.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder.paymentStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6 pb-6 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900 mb-3">Shipping Address</p>
                <div className="bg-neutral-100 p-4 rounded text-sm text-neutral-700">
                  <p>{selectedOrder.shippingAddress?.address}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wide">Payment Method</p>
                <p className="text-sm font-medium text-neutral-900">{selectedOrder.paymentMethod || 'Not specified'}</p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded border border-neutral-300 text-neutral-900 hover:bg-neutral-100 transition font-medium"
                >
                  Close
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
