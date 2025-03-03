import React, { useState, useEffect } from "react";
import PagesNavLayout from "../layouts/PagesNavLayout";
import { motion } from "framer-motion";
import axios from "axios";
import InmateForm from "../components/InmateForm";
import InmateList from "../components/InmatesList";
import SearchBar from "../components/SearchBar";

const InmateManagement = () => {
  const [nextInmateID, setNextInmateID] = useState(""); // Holds the next ID
  const [showForm, setShowForm] = useState(false); // Controls form visibility
  const [inmates, setInmates] = useState([]); // Holds fetched inmates
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInmates, setTotalInmates] = useState(0); // Track total inmates
  const [searchQuery, setSearchQuery] = useState(""); // Store search input
  const [searchResult, setSearchResult] = useState([]); // Store search results
  const [isSearching, setIsSearching] = useState(false); // Track search mode
  const [editInmate, setEditInmate] = useState(null); // Track inmate being edited
  const limit = 5; // Entries per page

  // Fetch the next available inmate ID
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

  // Fetch inmates from the backend
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

  useEffect(() => {
    if (!searchQuery) {
      setIsSearching(false);
      fetchInmates();
    }
  }, [page, searchQuery]);

  // Handle edit button click (open form with inmate data)
  const handleEditClick = (inmate) => {
    setEditInmate(inmate);
    setShowForm(true);
  };

  // Callback function to refresh inmates after register or edit
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
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
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
