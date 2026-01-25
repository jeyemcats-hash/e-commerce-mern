import { useState } from 'react';

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    priceRange: '',
    rating: ''
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: '',
      priceRange: '',
      rating: ''
    });
  };

  return (
    <div className="w-full mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search products..."
            className="w-full px-4 md:px-5 py-3 md:py-3.5 text-sm md:text-base rounded-lg border-2 border-slate-200 bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm hover:shadow-md"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Button */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full sm:w-auto px-4 md:px-5 py-3 md:py-3.5 bg-linear-to-r from-black to-black hover:from-neutral-500 hover:to-neutral-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm md:text-base shadow-md hover:shadow-lg hover:shadow-blue-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-3 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-30 w-full sm:w-64 p-5">
              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5">Category</label>
                  <select
                    value={selectedFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-blue-300 transition-all"
                  >
                    <option value="">All Categories</option>
                    <option value="Pants">Pants</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Accesories">Accesories</option>
                    <option value="Shoes">Shoes</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5">Price Range</label>
                  <select
                    value={selectedFilters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-blue-300 transition-all"
                  >
                    <option value="">All Prices</option>
                    <option value="0-750">₱0 - ₱750</option>
                    <option value="750-1500">₱750 - ₱1500</option>
                    <option value="1500-2500">₱1500 - ₱2500</option>
                    <option value="2500+">₱2500+</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5">Rating</label>
                  <select
                    value={selectedFilters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-blue-300 transition-all"
                  >
                    <option value="">All Ratings</option>
                    <option value="4">4★ & up</option>
                    <option value="3">3★</option>
                    <option value="2">2★</option>
                    <option value="1">1★</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all font-semibold text-sm mt-5 border-2 border-slate-200"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedFilters.category || selectedFilters.priceRange || selectedFilters.rating) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedFilters.category && (
            <span className="px-3 py-1.5 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-full text-xs md:text-sm font-semibold shadow-md">
              {selectedFilters.category}
            </span>
          )}
          {selectedFilters.priceRange && (
            <span className="px-3 py-1.5 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-full text-xs md:text-sm font-semibold shadow-md">
              {selectedFilters.priceRange}
            </span>
          )}
          {selectedFilters.rating && (
            <span className="px-3 py-1.5 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-full text-xs md:text-sm font-semibold shadow-md">
              {selectedFilters.rating}★
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
