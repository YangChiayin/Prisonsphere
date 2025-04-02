/**
 * @file VisitorManagement.js
 * @description Displays a list of inmates and allows users to manage visitor logs.
 * @module pages/VisitorManagement
 *
 * This component:
 * - Fetches and displays a paginated list of inmates.
 * - Supports searching inmates by name or ID.
 * - Provides a gateway to visitor log management for each inmate.
 *
 * Features:
 * - Uses `useState` for managing search queries, results, and pagination.
 * - Implements real-time search filtering.
 * - Fetches inmate data from the backend with pagination.
 * - Dynamically updates UI based on search input or paginated results.
 *
 * @requires react - React library for UI rendering.
 * @requires axios - Library for making HTTP requests.
 * @requires PagesNavLayout - Layout wrapper including sidebar and top navbar.
 * @requires SearchBar - Component for searching inmates.
 * @requires InmateList - Component for displaying inmate list.
 */
import React, { useState, useEffect } from "react";
import PagesNavLayout from "../layouts/PagesNavLayout";
import SearchBar from "../components/SearchBar";
import InmateList from "../components/InmatesList";
import axios from "axios";

/**
 * VisitorManagement Component
 * ---------------------------
 * - Displays a list of inmates and provides visitor log management access.
 * - Supports inmate search and paginated results.
 *
 * @component
 * @returns {JSX.Element} - The visitor management UI component.
 */
const VisitorManagement = () => {
  // **State Variables**
  const [searchQuery, setSearchQuery] = useState(""); // Stores search input
  const [searchResult, setSearchResult] = useState([]); // Stores search results
  const [isSearching, setIsSearching] = useState(false); // Tracks search mode
  const [inmates, setInmates] = useState([]); // Holds fetched inmate data
  const [loading, setLoading] = useState(true); // Indicates data loading state
  const [page, setPage] = useState(1); // Stores current page number
  const [totalPages, setTotalPages] = useState(1); // Stores total pages
  const [totalInmates, setTotalInmates] = useState(0); // Stores total number of inmates
  const limit = 5; // Number of entries per page

  /**
   * Fetches a paginated list of inmates from the backend.
   */
  const fetchInmates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/inmates?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setInmates(response.data.inmates);
      setTotalPages(response.data.totalPages);
      setTotalInmates(response.data.totalInmates || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inmates:", error);
      setTotalInmates(0);
      setLoading(false);
    }
  };

  /**
   * Refetches inmate records when the page number changes or when no search is active.
   */
  useEffect(() => {
    if (!searchQuery) {
      setIsSearching(false);
      fetchInmates();
    }
  }, [page, searchQuery]);

  return (
    <PagesNavLayout>
      {/* Search Bar */}
      <SearchBar
        setSearchResult={setSearchResult}
        setIsSearching={setIsSearching}
        setSearchQuery={setSearchQuery}
      />

      {/* Inmate List (Search Results or Default) */}
      <InmateList
        inmates={isSearching ? searchResult : inmates}
        loading={loading}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        totalInmates={isSearching ? searchResult.length : totalInmates}
        limit={limit}
        searchQuery={searchQuery}
        actionType="visitor"
      />
    </PagesNavLayout>
  );
};

export default VisitorManagement;
