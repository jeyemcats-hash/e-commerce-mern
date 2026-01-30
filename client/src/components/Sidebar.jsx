import { HomeIcon, ShopIcon, CategoryIcon, FavoritesIcon, CartIcon, OrderIcon, SettingsIcon } from '../assets/icons/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Sidebar({ isOpen = true }) {
  const { isLoggedIn, user, openLoginPage, logout } = useAuth();

  const menuItems = [
    { id: 2, label: 'Shop', icon: ShopIcon },
    { id: 4, label: 'Favorites', icon: FavoritesIcon },
    { id: 5, label: 'Cart', icon: CartIcon },
    { id: 6, label: 'Order', icon: OrderIcon },
    { id: 7, label: 'Settings', icon: SettingsIcon },
  ];

  const isComponent = (icon) => typeof icon === 'function';

  const handleNavClick = (label) => {
    const navigate = (path) => {
      setTimeout(() => {
        window.location.href = path;
      }, 0);
    };

    if (label === 'Shop') {
      navigate('/');
      return;
    }
    if (label === 'Favorites') {
      navigate('/favorites');
      return;
    }
    if (label === 'Cart') {
      navigate('/cart');
      return;
    }
    if (label === 'Order') {
      navigate('/orders');
      return;
    }
    if (label === 'Settings') {
      navigate('/settings');
      return;
    }
  };

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-l border-neutral-100 z-10 transition-all duration-500 ease-in-out ${isOpen ? 'w-64' : 'w-0'} overflow-y-auto`}>
      {/* Navigation Menu */}
      <nav className="p-3 md:p-4 space-y-5 mt-4 md:mt-5 sidebar-nav">
        {/* Welcome Section - Only show if logged in */}
        {isLoggedIn && (
          <div className="mb-4 md:mb-5 pb-3 md:pb-3 border-b border-neutral-100">
            <p className="text-neutral-600 text-xs md:text-sm ml-2 mb-1 md:mb-2 mt-12 md:mt-12 font-normal">Hi <span className="text-neutral-900 font-normal">{user?.name}</span> Welcome to HERO!</p>
          </div>
        )}

        {/* Main Menu Items - Only show if logged in */}
        {isLoggedIn && (
          <>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.label)}
                className="w-full text-left pl-2 md:pl-3 py-1.5 md:py-2.5 hover:bg-neutral-50 active:bg-black active:text-white rounded text-xs font-normal text-neutral-800 transition-colors duration-150 flex items-center gap-2 md:gap-3 whitespace-nowrap sidebar-item"
              >
                <span className={isComponent(item.icon) ? 'w-4 h-4 md:w-4 md:h-4 flex-shrink-0 pb-6' : 'text-sm md:text-base flex-shrink-0'}>
                  {isComponent(item.icon) ? <item.icon /> : item.icon}
                </span>
                <span className="overflow-hidden text-ellipsis ml-4 font-normal">{item.label}</span>
              </button>
            ))}
          </>
        )}

        {/* Sign In Section - Show if NOT logged in, Auth buttons show if logged in */}
        <div className={`${isLoggedIn ? 'mt-5 md:mt-6 pt-3 md:pt-3 border-t border-neutral-100' : 'mt-12 md:mt-16 pt-3 md:pt-3'}`}>
          {!isLoggedIn ? (
            <>
              <button 
                onClick={() => openLoginPage('login')}
                className="w-full text-left pl-2 md:pl-2 py-1.5 md:py-1.5 hover:bg-neutral-50 rounded text-xs font-normal text-neutral-800 transition-colors duration-150"
              >
                Login
              </button>
              <p className="text-neutral-500 text-xs ml-2 mb-1 mt-2 md:mt-2 font-normal">Don't have an account?</p>
              <button 
                onClick={() => openLoginPage('signup')}
                className="w-full text-left hover:bg-neutral-50 rounded py-1.5 md:py-1.5 pl-2 text-xs font-normal text-neutral-800 transition-colors duration-150"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button 
              onClick={logout}
              className="w-full text-left pl-2 md:pl-2 py-1.5 md:py-1.5 hover:bg-red-50 rounded text-xs font-normal text-red-600 transition-colors duration-150"
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