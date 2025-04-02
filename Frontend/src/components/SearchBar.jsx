/**
 * @file SearchBar.js
 * @description Search bar component for filtering inmate records.
 * @module components/SearchBar
 *
 * This component:
 * - Allows users to search for inmates by name or ID.
 * - Fetches filtered results from the backend API.
 * - Handles search errors and resets state when input is cleared.
 *
 * Features:
 * - Triggers search on "Enter" key press or button click.
 * - Provides real-time search updates when the query changes.
 * - Clears results and resets the search state when input is empty.
 *
 * @requires react - React library for state management.
 * @requires axios - Library for making HTTP requests.
 * @requires react-icons - Provides search icon for better UI experience.
 */

import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import axios from "axios";

/**
 * SearchBar Component
 * -------------------
 * - Manages search input and fetches filtered inmate records.
 * - Updates parent component states with search results and status.
 *
 * @component
 * @param {Function} setSearchResult - Function to update search results in the parent component.
 * @param {Function} setIsSearching - Function to update search mode status.
 * @param {Function} setSearchQuery - Function to update the active search query.
 * @returns {JSX.Element} - The search bar UI component.
 */
const SearchBar = ({ setSearchResult, setIsSearching, setSearchQuery }) => {
  const [query, setQuery] = useState(""); // Stores the user's search input
  const [error, setError] = useState(""); // Stores search error messages

  /**
   * Handles search execution.
   * - Fetches matching inmate records from the backend.
   * - Updates the search result state in the parent component.
   * - Displays an error message if no records are found.
   */
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
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/inmates/search?query=${query}`,
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

  /**
   * Handles "Enter" key press event for triggering search.
   *
   * @param {Object} e - Event object for keydown event.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * Handles input changes in the search bar.
   * - Updates the query state dynamically.
   * - Clears results and resets search state when input is empty.
   *
   * @param {Object} e - Event object for input change.
   */
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
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-all cursor-pointer"
      >
        Search
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default SearchBar;
