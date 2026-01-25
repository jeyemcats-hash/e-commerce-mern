import { HomeIcon, ShopIcon, CategoryIcon, FavoritesIcon, CartIcon, OrderIcon, SettingsIcon } from '../assets/icons/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Sidebar({ isOpen = true }) {
  const { isLoggedIn, user, openLoginPage, logout } = useAuth();

  const menuItems = [
    { id: 1, label: 'Home', icon: HomeIcon },
    { id: 2, label: 'Shop', icon: ShopIcon },
    { id: 3, label: 'Categories', icon: CategoryIcon },
    { id: 4, label: 'Favorites', icon: FavoritesIcon },
    { id: 5, label: 'Cart', icon: CartIcon },
    { id: 6, label: 'Order', icon: OrderIcon },
    { id: 7, label: 'Settings', icon: SettingsIcon },
  ];

  const isComponent = (icon) => typeof icon === 'function';

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg z-10 transition-all duration-500 ease-in-out ${isOpen ? 'w-64' : 'w-0'} overflow-y-auto`}>
      {/* Navigation Menu */}
      <nav className="p-3 md:p-4 space-y-5 md:space-y-2 mt-4 md:mt-5">
        {/* Welcome Section - Only show if logged in */}
        {isLoggedIn && (
          <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b">
            <p className="text-gray-600 text-sm md:text-base ml-2 mb-2 mt-12 md:mb-3">Hi <span className="font-bold text-gray-800">{user?.name}</span>! Welcome to Hero!</p>
          </div>
        )}

        {/* Main Menu Items - Only show if logged in */}
        {isLoggedIn && (
          <>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className="w-full text-left pl-2 md:pl-3 py-2 md:py-3 hover:bg-blue-50 rounded text-xs md:text-sm font-medium text-gray-800 transition-all flex items-center gap-2 md:gap-3 whitespace-nowrap"
              >
                <span className={isComponent(item.icon) ? 'w-4 h-4 md:w-5 md:h-5 flex-shrink-0' : 'text-base md:text-lg flex-shrink-0'}>
                  {isComponent(item.icon) ? <item.icon /> : item.icon}
                </span>
                <span className="overflow-hidden text-ellipsis ml-5">{item.label}</span>
              </button>
            ))}
          </>
        )}

        {/* Sign In Section - Show if NOT logged in, Auth buttons show if logged in */}
        <div className={`${isLoggedIn ? 'mt-6 md:mt-8 pt-4 md:pt-6 border-t' : 'mt-12 md:mt-16 pt-4 md:pt-6'}`}>
          {!isLoggedIn ? (
            <>
              <button 
                onClick={() => openLoginPage('login')}
                className="w-full text-left pl-2 md:pl-2 py-2 md:py-2 hover:bg-gray-100 rounded text-xs md:text-sm font-medium text-gray-800 transition-all"
              >
                Login
              </button>
              <p className="text-gray-600 text-xs ml-2 mb-2 mt-3 md:mt-5">Don't have an account?</p>
              <button 
                onClick={() => openLoginPage('signup')}
                className="w-full text-left hover:bg-gray-100 rounded py-2 md:py-2 pl-2 text-xs md:text-sm font-medium text-gray-800 transition-all"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button 
              onClick={logout}
              className="w-full text-left pl-2 md:pl-2 py-2 md:py-2 hover:bg-red-50 rounded text-xs md:text-sm font-medium text-red-600 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;