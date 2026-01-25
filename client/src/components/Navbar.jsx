import { useAuth } from '../context/AuthContext.jsx';

function NavigationBar() {
  const { isLoggedIn } = useAuth();

  return (
    <nav className="w-full h-16 bg-neutral-950 fixed top-0 left-0 z-20 flex items-center px-4 md:px-6">
      {/* Left: Logo (kept in its own flex slot to balance center alignment) */}
      <div className="flex-1 flex items-center">
        <div className="text-lg md:text-xl font-semibold text-neutral-200 hover:cursor-pointer whitespace-nowrap">HERO</div>
      </div>

      {/* Center Icon (desktop only) */}
      <div className="hidden md:flex flex-1 justify-center">
        <img className="w-5 h-5 md:w-6 md:h-6 hover:cursor-pointer" src="src/assets/images/Icon_White.svg" alt="icon" />
      </div>

      {/* Right Side Items */}
      <div className="flex flex-1 justify-end items-center">
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {/* Navigation Buttons - Show if logged in */}
          {isLoggedIn && (
            <>
              <button className="px-3 md:px-4 py-2 text-white text-sm md:text-base rounded hover:bg-neutral-700 transition-all">Contact</button>
              <button className="px-3 md:px-4 py-2 text-white text-sm md:text-base rounded hover:bg-neutral-700 transition-all">FAQ</button>
            </>
          )}
        </div>

        {/* Mobile Icon aligned to the far right */}
        <div className="md:hidden">
          <img className="w-5 h-5 hover:cursor-pointer" src="src/assets/images/Icon_White.svg" alt="menu" />
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;