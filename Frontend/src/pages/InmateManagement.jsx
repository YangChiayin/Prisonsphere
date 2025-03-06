/**
 * @file InmateManagement.js
 * @description Component for managing inmates, including registration, search, and editing.
 * @module pages/InmateManagement
 *
 * This component:
 * - Fetches and displays a paginated list of inmates.
 * - Allows searching for specific inmates.
 * - Opens a form for registering new inmates or editing existing ones.
 * - Handles inmate data updates dynamically.
 *
 * @requires react - React library for UI components.
 * @requires axios - HTTP client for API requests.
 * @requires framer-motion - Animation library for smooth UI transitions.
 * @requires InmateForm - Component for inmate registration and editing.
 * @requires InmateList - Component displaying the list of inmates.
 * @requires SearchBar - Component for searching inmates.
 */

import React, { useState, useEffect } from "react";
import PagesNavLayout from "../layouts/PagesNavLayout";
import { motion } from "framer-motion";
import axios from "axios";
import InmateForm from "../components/InmateForm";
import InmateList from "../components/InmatesList";
import SearchBar from "../components/SearchBar";

/**
 * @component InmateManagement
 * @description Handles inmate registration, searching, and editing.
 *
 * @returns {JSX.Element} - Renders the inmate management interface.
 */

const InmateManagement = () => {
  // **State Variables**
  const [nextInmateID, setNextInmateID] = useState(""); // Holds the next available inmate ID
  const [showForm, setShowForm] = useState(false); // Controls form visibility
  const [inmates, setInmates] = useState([]); // Holds the fetched list of inmates
  const [loading, setLoading] = useState(true); // Tracks data loading state
  const [page, setPage] = useState(1); // Tracks current pagination page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages for pagination
  const [totalInmates, setTotalInmates] = useState(0); // Tracks total inmates
  const [searchQuery, setSearchQuery] = useState(""); // Stores user search input
  const [searchResult, setSearchResult] = useState([]); // Holds search results
  const [isSearching, setIsSearching] = useState(false); // Tracks search mode (active/inactive)
  const [editInmate, setEditInmate] = useState(null); // Holds the inmate data being edited
  const limit = 5; // Number of inmates per page

  /**
   * Fetches the next available inmate ID from the backend.
   * Ensures that every new inmate receives a unique identifier.
   */
  useEffect(() => {
    const fetchNextID = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/prisonsphere/inmates/next-id",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setNextInmateID(response.data.nextInmateID);
      } catch (error) {
        console.error("Error fetching next Inmate ID:", error);
      }
    };
    fetchNextID();
  }, []);

  /**
   * Fetches the list of inmates from the backend with pagination.
   * Updates state variables with fetched data.
   */
  const fetchInmates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/prisonsphere/inmates?page=${page}&limit=${limit}`,
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
   * Fetches inmates when:
   * - The user is not searching.
   * - The page number changes.
   */
  useEffect(() => {
    if (!searchQuery) {
      setIsSearching(false);
      fetchInmates();
    }
  }, [page, searchQuery]);

  /**
   * Handles the "Edit" button click by opening the form with inmate data.
   * @param {Object} inmate - The inmate object to be edited.
   */
  const handleEditClick = (inmate) => {
    setEditInmate(inmate);
    setShowForm(true);
  };

  /**
   * Callback function that refreshes the inmate list after a successful form submission.
   * - Used for both new inmate registration and updating existing inmates.
   */
  const handleFormSuccess = () => {
    fetchInmates(); // Refresh inmate list
    setShowForm(false); // Close form after success
  };

  return (
    <PagesNavLayout>
      <div className="relative space-y-4">
        {/* Search Bar */}
        <SearchBar
          setSearchResult={setSearchResult}
          setIsSearching={setIsSearching}
          setSearchQuery={setSearchQuery} // Pass search query state
        />

        {/* Register Button*/}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {searchQuery ? "Search Results" : "Registered Inmates"}
          </h3>
          <motion.button
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => {
              setEditInmate(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Register New Inmate
          </motion.button>
        </div>

        {/* Divider for Clean Separation */}
        <hr className="border-gray-200" />

        {/* Inmate List (Search Results or Default) */}
        <InmateList
          inmates={isSearching ? searchResult : inmates}
          onEdit={handleEditClick}
          loading={loading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          totalInmates={isSearching ? searchResult.length : totalInmates}
          limit={limit}
          searchQuery={searchQuery}
        />
      </div>

      {showForm && (
        <InmateForm
          nextInmateID={nextInmateID}
          onClose={() => setShowForm(false)}
          inmateData={editInmate}
          onFormSuccess={handleFormSuccess}
        />
      )}
    </PagesNavLayout>
  );
};

export default InmateManagement;
