import { useState } from 'react';

function SearchBar({ onSearch, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    priceRange: '',
    rating: ''
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (filterType, value) => {
    const updated = {
      ...selectedFilters,
      [filterType]: value
    };
    setSelectedFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: '',
      priceRange: '',
      rating: ''
    });
    onFilterChange({
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
            className="w-md px-3 md:px-4 py-2 md:py-2.5 text-sm rounded-lg border border-neutral-300 bg-white hover:border-neutral-400 focus:outline-none focus:border-black transition-all placeholder:text-neutral-500 shadow-none"
          />
          <svg className="absolute left-103 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-neutral-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Button */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-normal text-sm shadow-none border border-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 bg-white border border-neutral-200 rounded-lg shadow-md z-30 w-full sm:w-64 p-4">
              <div className="space-y-3">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-normal text-neutral-900 mb-2">Category</label>
                  <select
                    value={selectedFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white hover:border-neutral-400 transition-all font-normal"
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
                  <label className="block text-sm font-normal text-neutral-900 mb-2">Price Range</label>
                  <select
                    value={selectedFilters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white hover:border-neutral-400 transition-all font-normal"
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
                  <label className="block text-sm font-normal text-neutral-900 mb-2">Rating</label>
                  <select
                    value={selectedFilters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-white hover:border-neutral-400 transition-all font-normal"
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
                  className="w-full px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-900 rounded-lg transition-all font-normal text-sm mt-4 border border-neutral-300"
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
            <span className="px-3 py-1.5 bg-black text-white rounded-full text-xs md:text-sm font-normal shadow-sm">
              {selectedFilters.category}
            </span>
          )}
          {selectedFilters.priceRange && (
            <span className="px-3 py-1.5 bg-black text-white rounded-full text-xs md:text-sm font-normal shadow-sm">
              {selectedFilters.priceRange}
            </span>
          )}
          {selectedFilters.rating && (
            <span className="px-3 py-1.5 bg-black text-white rounded-full text-xs md:text-sm font-normal shadow-sm">
              {selectedFilters.rating}★
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
