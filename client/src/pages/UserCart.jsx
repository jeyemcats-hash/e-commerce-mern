import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function UserCart() {
  const { user, isLoggedIn, openLoginPage } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'Philippines',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userId = user?.id || user?._id;

  useEffect(() => {
    const stored = localStorage.getItem('cartItems');
    setCartItems(stored ? JSON.parse(stored) : []);
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const updateCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cartItems', JSON.stringify(items));
  };

  const updateQuantity = (id, quantity) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    updateCart(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
  };

  const handleCheckout = async () => {
    setError('');
    setSuccess('');

    if (!isLoggedIn) {
      openLoginPage('login', 'cart');
      return;
    }

    if (!cartItems.length) {
      setError('Your cart is empty.');
      return;
    }

    if (!shipping.address || !shipping.city || !shipping.postalCode || !shipping.country) {
      setError('Please complete the shipping details.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token || !userId) {
        throw new Error('Please log in again.');
      }

      const orderItems = cartItems.map((item) => ({
        product: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: userId,
          orderItems,
          shippingAddress: shipping,
          paymentMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      updateCart([]);
      setSuccess('Order placed successfully.');
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-8 bg-white rounded-2xl mt-4 md:mt-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">My Cart</h2>
          <p className="text-neutral-700 text-sm mt-1">Review items before checkout</p>
        </div>
        <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <p className="text-neutral-300 text-sm">
            Total Items: <span className="font-bold text-neutral-200">{cartItems.length}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
              <p className="text-neutral-600 text-sm">Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 border border-neutral-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-neutral-100">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                  <p className="text-neutral-600 text-sm">₱{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-neutral-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 text-sm hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border border-neutral-200 rounded-xl p-4 md:p-6 bg-white shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900">Checkout</h3>
          <div className="text-sm text-neutral-700">Subtotal: ₱{subtotal.toFixed(2)}</div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Address"
              value={shipping.address}
              onChange={(e) => setShipping((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="City"
              value={shipping.city}
              onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={shipping.postalCode}
              onChange={(e) => setShipping((prev) => ({ ...prev, postalCode: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Country"
              value={shipping.country}
              onChange={(e) => setShipping((prev) => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            >
              <option>Cash on Delivery</option>
              <option>Credit Card</option>
              <option>PayPal</option>
              <option>GCash</option>
            </select>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Confirm Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserCart;
