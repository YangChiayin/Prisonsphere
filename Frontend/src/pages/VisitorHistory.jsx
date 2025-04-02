/**
 * @file VisitorHistory.js
 * @description Displays a paginated list of visitor records for a specific inmate.
 * @module pages/VisitorHistory
 *
 * This component:
 * - Fetches and displays all visitor logs for an inmate.
 * - Provides search, date filtering, and pagination functionality.
 * - Allows users to add new visitor logs or edit existing records.
 *
 * Features:
 * - Uses `useParams` to dynamically retrieve visitors for a specific inmate.
 * - Fetches visitor history from the backend with pagination.
 * - Implements filtering by visitor name, purpose, and visit date.
 * - Supports modal-based visitor form for creating/editing records.
 *
 * @requires react - React library for UI rendering.
 * @requires react-router-dom - Library for managing dynamic routes.
 * @requires axios - Library for making HTTP requests.
 * @requires react-icons - Provides icons for better UI experience.
 * @requires PagesNavLayout - Layout wrapper including sidebar and top navbar.
 * @requires VisitorForm - Component for adding/editing visitor records.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PagesNavLayout from "../layouts/PagesNavLayout";
import { AiOutlineSearch } from "react-icons/ai";
import VisitorForm from "../components/VisitorForm";

/**
 * VisitorHistory Component
 * ------------------------
 * - Displays a paginated list of visitor records for a specific inmate.
 * - Allows users to search, filter, add, and edit visitor records.
 *
 * @component
 * @returns {JSX.Element} - The visitor history UI component.
 */
const VisitorHistory = () => {
  const { inmateId } = useParams(); // **Extracts inmate ID from URL params**
  const navigate = useNavigate(); // **Handles navigation within the app**
  const [visitors, setVisitors] = useState([]); // **Stores visitor records**
  const [searchQuery, setSearchQuery] = useState(""); // **Stores search input**
  const [startDate, setStartDate] = useState(""); // **Stores start date filter**
  const [endDate, setEndDate] = useState(""); // **Stores end date filter**
  const [loading, setLoading] = useState(true); // **Indicates loading state**
  const [page, setPage] = useState(1); // **Manages pagination**
  const limit = 5; // **Sets visitors per page**
  const [totalPages, setTotalPages] = useState(1); // **Stores total pages**
  const [showForm, setShowForm] = useState(false); // **Toggles visitor form modal**
  const [editVisitor, setEditVisitor] = useState(null); // **Stores visitor data for editing**
  const [totalVisitors, setTotalVisitors] = useState(0); // **Stores total visitor count**

  /**
   * Fetches visitors for the inmate with pagination and filtering.
   */
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/visitors/${inmateId}?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setVisitors(response.data.visitors);
      setTotalVisitors(response.data.totalVisitors);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching visitor history:", error);
      setLoading(false);
    }
  };

  /**
   * Refetches visitor records whenever filters or pagination change.
   */
  useEffect(() => {
    fetchVisitors();
  }, [searchQuery, startDate, endDate, page]);

  /**
   * Refreshes visitor list after adding or editing a visitor.
   */
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditVisitor(null);
    fetchVisitors();
  };

  return (
    <PagesNavLayout>
      <div className="space-y-4">
        {/* Title & New Visit Button */}
        <div className="flex justify-end items-center">
          <div className="space-x-5">
            {/* Back Button */}
            <button
              onClick={() => navigate(`/visitors`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
            >
              ← Back to Inmate
            </button>
            <button
              onClick={() => {
                setShowForm(true);
                setEditVisitor(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              + New Visit
            </button>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
          {/* Search Box */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium">Search</label>
            <div className="relative flex items-center">
              <AiOutlineSearch
                size={18}
                className="absolute left-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by visitor name or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-2 border rounded-md text-gray-700 shadow-sm"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-700 shadow-sm"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-700 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Visitors Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : visitors.length === 0 ? (
            <p className="text-gray-500 text-center">
              No visitor records found.
            </p>
          ) : (
            <>
              <table className="w-full border-collapse text-gray-700">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold">
                    <th className="p-3">Visitor Name</th>
                    <th className="p-3">Visit Date</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr
                      key={visitor._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{visitor.visitorName}</td>
                      <td className="p-3">
                        {new Date(visitor.visitTimestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700">
                          {visitor.purposeOfVisit}
                        </span>
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/visitors/details/${visitor._id}`)
                          }
                          className="px-3 py-1 text-blue-600 border rounded-md text-sm hover:bg-blue-50 transition"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => {
                            setEditVisitor(visitor);
                            setShowForm(true);
                          }}
                          className="px-2 py-1 text-yellow-600 border rounded-md text-sm hover:bg-yellow-50 transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls - Styled Correctly */}
              <div className="mt-4 flex justify-between items-center">
                <p className="text-gray-500 text-sm">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, totalVisitors)} of {totalVisitors}{" "}
                  entries
                </p>

                <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Show VisitorForm modal when needed */}
      {showForm && (
        <VisitorForm
          inmateId={inmateId}
          visitorData={editVisitor}
          onClose={() => setShowForm(false)}
          onFormSuccess={handleFormSuccess}
        />
      )}
    </PagesNavLayout>
  );
};

export default VisitorHistory;
