import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import axios from "axios";

const SearchBar = ({ setSearchResult, setIsSearching, setSearchQuery }) => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchQuery(""); // Reset search query
      setSearchResult([]); // Clear search results
      setIsSearching(false); // Exit search mode
      return;
    }

    try {
      setError("");
      const response = await axios.get(
        `http://localhost:5000/prisonsphere/inmates/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSearchResult(response.data);
      setIsSearching(true);
      setSearchQuery(query);
    } catch (error) {
      setError("No inmates found.");
      setSearchResult([]);
      setIsSearching(true);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle clearing search input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSearchQuery(""); // Reset query state
      setSearchResult([]); // Clear search results
      setIsSearching(false); // Exit search mode
    }
  };

  return (
    <div className="w-full flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-gray-300">
      <AiOutlineSearch size={18} className="text-gray-400 mr-2" />
      <input
        type="text"
        placeholder="Search by inmate name or ID..."
        value={query}
        onChange={handleInputChange} // Listen for input changes
        onKeyDown={handleKeyDown} // Trigger search on Enter key
        className="flex-grow text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-all"
      >
        Search
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default SearchBar;
