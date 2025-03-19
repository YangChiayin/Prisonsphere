/**
 * @file ParoleManagement.js
 * @description Handles the management of parole applications, including filtering, searching, and reviewing.
 * @module components/ParoleManagement
 *
 * This component:
 * - Fetches and displays parole hearings.
 * - Provides search and filter options (status, date range, inmate ID/name).
 * - Allows reviewing pending paroles.
 * - Supports pagination for better navigation.
 *
 * @requires react - React library for component-based UI.
 * @requires axios - HTTP client for making API requests.
 * @requires react-router-dom - Provides navigation capabilities.
 * @requires ParoleForm - Modal component for requesting parole hearings.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import PagesNavLayout from "../layouts/PagesNavLayout";
import { AiOutlineSearch } from "react-icons/ai";
import ParoleForm from "../components/ParoleForm"; // Form modal
import ProfileImgPlaceholder from "../assets/images/ProfilePlaceholder.png";

/**
 * @component ParoleManagement
 * @description Displays and manages parole applications with filtering, searching, and reviewing options.
 *
 * @returns {JSX.Element} - Renders the parole management UI.
 */
const ParoleManagement = () => {
  const navigate = useNavigate();
  const [paroles, setParoles] = useState([]); // Holds the list of parole applications
  const [searchQuery, setSearchQuery] = useState(""); // Stores search input
  const [startDate, setStartDate] = useState(""); // Start date filter
  const [endDate, setEndDate] = useState(""); // End date filter
  const [statusFilter, setStatusFilter] = useState(""); // Status filter (Pending, Approved, Denied)
  const [loading, setLoading] = useState(true); // Indicates data loading state
  const [showForm, setShowForm] = useState(false); // Controls parole request form visibility
  const [page, setPage] = useState(1); // Tracks current pagination page
  const [totalPages, setTotalPages] = useState(1); // Stores the total number of pages
  const [totalParoles, setTotalParoles] = useState(0); // Total count of parole applications
  const limit = 8; // Ensures only 8 records per page

  /**
   * Fetches parole applications from the backend based on filters and pagination.
   * Runs whenever filters, search query, or page number changes.
   */
  const fetchParoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/prisonsphere/paroles?search=${searchQuery}&status=${statusFilter}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setParoles(response.data.paroles || []);
      setTotalPages(response.data.totalPages);
      setTotalParoles(response.data.totalParoles);
    } catch (error) {
      console.error("Error fetching paroles:", error);
      setParoles([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches paroles when filters, search input, or page number changes.
   */
  useEffect(() => {
    fetchParoles();
  }, [searchQuery, statusFilter, startDate, endDate, page]);

  return (
    <PagesNavLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Parole Hearings
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            + Request Parole
          </button>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4"
        >
          {/* Search */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium">Search</label>
            <div className="relative flex items-center">
              <AiOutlineSearch
                size={18}
                className="absolute left-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by inmate ID or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 p-2 border rounded-md text-gray-700 shadow-sm"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border rounded-md text-gray-700 shadow-sm"
            />
          </div>

          {/* End Date */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border rounded-md text-gray-700 shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border rounded-md text-gray-700 shadow-sm"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
        </motion.div>

        {/* Parole Table */}
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : paroles.length === 0 ? (
            <p className="text-gray-500 text-center">
              No parole hearings found.
            </p>
          ) : (
            <>
              <table className="w-full border-collapse text-gray-700">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold">
                    <th className="p-3">Profile</th>
                    <th className="p-3">Inmate Name</th>
                    <th className="p-3">Inmate ID</th>
                    <th className="p-3">Hearing Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paroles.map((parole, index) => (
                    <motion.tr
                      key={parole._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: "#f9fafb",
                        boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.05)",
                      }}
                      className="border-b border-gray-200 transition"
                    >
                      <td className="p-3">
                        <img
                          src={
                            parole.inmate?.profilePicture ||
                            ProfileImgPlaceholder
                          }
                          alt="Profile"
                          className="w-10 h-10 object-cover rounded-full"
                        />
                      </td>

                      <td className="p-3">
                        {parole.inmate?.firstName || "Unknown"}{" "}
                        {parole.inmate?.lastName || "Inmate"}
                      </td>

                      <td className="p-3">
                        {parole.inmate?.inmateID || "N/A"}
                      </td>

                      <td className="p-3">
                        {parole.hearingDate
                          ? new Date(parole.hearingDate).toLocaleDateString(
                              "en-CA",
                              {
                                timeZone: "UTC",
                              }
                            ) // Force UTC time zone to prevent local offset shift
                          : "No Date"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full 
                      ${
                        parole.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : parole.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                        >
                          {parole.status}
                        </span>
                      </td>

                      <td className="p-3">
                        {parole.status === "Pending" && (
                          <button
                            onClick={() => navigate(`/paroles/${parole._id}`)}
                            className="px-3 py-1 text-blue-600 border rounded-md text-sm hover:bg-blue-50 transition"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-500 text-sm">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, totalParoles)} of {totalParoles}{" "}
                  entries
                </p>

                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
                      page === 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPage(index + 1)}
                      className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
                        page === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
                      page === totalPages
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
      {/* Parole Request Form Modal */}
      {showForm && (
        <ParoleForm
          onClose={() => setShowForm(false)}
          onFormSuccess={fetchParoles}
        />
      )}
    </PagesNavLayout>
  );
};

export default ParoleManagement;
