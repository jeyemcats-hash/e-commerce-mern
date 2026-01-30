import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function UserFavorites() {
  const { isLoggedIn, openLoginPage } = useAuth();
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favoriteItems');
    return stored ? JSON.parse(stored) : [];
  });

  const totalFavorites = useMemo(() => favorites.length, [favorites]);

  const removeFavorite = (id) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    localStorage.setItem('favoriteItems', JSON.stringify(updated));
  };

  return (
    <div className="w-full p-4 md:p-8 bg-white rounded-2xl mt-4 md:mt-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">My Favorites</h2>
          <p className="text-neutral-700 text-sm mt-1">Your saved products</p>
        </div>
        <div className="px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
          <p className="text-neutral-300 text-sm">
            Total Favorites: <span className="font-bold text-neutral-200">{totalFavorites}</span>
          </p>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
          <p className="text-neutral-700 mb-4">Please log in to view your favorites.</p>
          <button
            onClick={() => openLoginPage('login', 'favorites')}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-100 hover:bg-neutral-700 transition"
          >
            Log in
          </button>
        </div>
      )}

      {isLoggedIn && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
              <p className="text-neutral-600 text-sm">No favorites yet.</p>
            </div>
          ) : (
            favorites.map((item) => (
              <div key={item.id} className="bg-neutral-100 rounded-xl shadow-sm p-5">
                <div className="relative overflow-hidden rounded-lg mb-4 bg-neutral-900 h-48">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2">{item.name}</h3>
                  <p className="text-neutral-700 text-sm">Price: ${item.price}</p>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="mt-2 text-red-600 text-sm hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default UserFavorites;
