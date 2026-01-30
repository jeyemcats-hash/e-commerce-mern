import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'delivering', label: 'Delivering' },
  { key: 'receiving', label: 'Receiving' },
  { key: 'done', label: 'Done' },
];

const mapOrderStatus = (status) => {
  switch (status) {
    case 'Processing':
      return 'processing';
    case 'Shipped':
      return 'shipping';
    case 'Delivered':
      return 'done';
    case 'Cancelled':
      return 'done';
    default:
      return 'processing';
  }
};

function UserOrders() {
  const { user, isLoggedIn, openLoginPage } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userId = user?.id || user?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn || !userId) {
        setOrders([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/orders/user/${userId}`, {
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
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL, isLoggedIn, userId]);

  const ordersByStatus = useMemo(() => {
    const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {});
    orders.forEach((order) => {
      const key = mapOrderStatus(order.orderStatus);
      counts[key] += 1;
      counts.all += 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeStatus === 'all') return orders;
    return orders.filter((order) => mapOrderStatus(order.orderStatus) === activeStatus);
  }, [orders, activeStatus]);

  return (
    <div className="w-full p-4 md:p-8 bg-white rounded-2xl mt-4 md:mt-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">My Orders</h2>
          <p className="text-neutral-700 text-sm mt-1">Track your order status and history</p>
        </div>
        <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <p className="text-neutral-300 text-sm">
            Total Orders: <span className="font-bold text-neutral-200">{orders.length}</span>
          </p>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
          <p className="text-neutral-700 mb-4">Please log in to view your orders.</p>
          <button
            onClick={() => openLoginPage('login', 'orders')}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-100 hover:bg-neutral-700 transition"
          >
            Log in
          </button>
        </div>
      )}

      {isLoggedIn && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.key}
                onClick={() => setActiveStatus(status.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  activeStatus === status.key
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                {status.label} ({ordersByStatus[status.key] || 0})
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-neutral-600 text-sm">Loading orders...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
              <p className="text-neutral-600 text-sm">No orders found for this status.</p>
            </div>
          )}

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="border border-neutral-200 rounded-xl p-4 md:p-6 bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-sm text-neutral-500">Order ID</p>
                    <p className="text-neutral-900 font-semibold break-all">{order._id}</p>
                  </div>
                  <div className="text-sm text-neutral-600">
                    Items: <span className="font-semibold text-neutral-900">{order.orderItems?.length || 0}</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    Total: <span className="font-semibold text-neutral-900">₱{order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white">
                    {mapOrderStatus(order.orderStatus)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UserOrders;
