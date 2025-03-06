/**
 * @file ParoleForm.js
 * @description Form for submitting a parole application for an inmate.
 * @module components/ParoleForm
 *
 * This component:
 * - Allows wardens to request parole hearings for inmates.
 * - Fetches and filters inmate records dynamically.
 * - Validates form inputs, including future hearing dates.
 * - Sends parole application data to the backend.
 *
 * @requires react - React library for component-based UI.
 * @requires axios - HTTP client for making API requests.
 * @requires framer-motion - Animation library for smooth UI transitions.
 * @requires react-toastify - Notification library for user feedback.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * @component ParoleForm
 * @description Form for submitting a parole application for an inmate.
 *
 * @param {Object} props - Component properties.
 * @param {Function} props.onClose - Callback function to close the form.
 * @param {Function} props.onFormSuccess - Callback function to refresh parole list upon successful submission.
 *
 * @returns {JSX.Element} - Renders the parole request form.
 */
const ParoleForm = ({ onClose, onFormSuccess }) => {
  const [inmates, setInmates] = useState([]); // Holds the list of inmates
  const [filteredInmates, setFilteredInmates] = useState([]); // Stores filtered inmates based on search query
  const [searchQuery, setSearchQuery] = useState(""); // Tracks user input for searching inmates
  const [selectedInmate, setSelectedInmate] = useState(null); // Stores the selected inmate
  const [hearingDate, setHearingDate] = useState(""); // Stores the parole hearing date
  const [loading, setLoading] = useState(false); // Indicates form submission state

  /**
   * Fetches a list of inmates from the backend.
   * Runs on initial component mount.
   */
  useEffect(() => {
    const fetchInmates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/prisonsphere/inmates",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setInmates(response.data.inmates || []);
      } catch (error) {
        console.error("Error fetching inmates:", error);
      }
    };

    fetchInmates();
  }, []);

  /**
   * Filters inmates based on user search input.
   * Runs every time `searchQuery` or `inmates` state changes.
   */
  useEffect(() => {
    if (!searchQuery) {
      setFilteredInmates([]); // Hide results if input is empty
      return;
    }

    const filtered = inmates.filter(
      (inmate) =>
        inmate.inmateID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${inmate.firstName} ${inmate.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    setFilteredInmates(filtered);
  }, [searchQuery, inmates]);

  /**
   * Handles form submission for parole request.
   * Validates required fields and submits the request to the backend.
   *
   * @param {Event} e - Form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInmate || !hearingDate) {
      toast.error("⚠ Please fill in all required fields.");
      return;
    }

    // Validate hearing date (must be in the future)
    const today = new Date();
    const selectedDate = new Date(hearingDate);
    if (selectedDate <= today) {
      toast.error("⚠ Hearing date must be in the future.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/prisonsphere/paroles",
        {
          inmate: selectedInmate._id, // Send selected inmate ID
          hearingDate,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Parole request submitted successfully!");
      setTimeout(() => {
        onClose();
        onFormSuccess(); // Refresh parole list
      }, 1000);
    } catch (error) {
      toast.error("⚠ Error submitting parole request.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-20 backdrop-blur-lg"
    >
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Request Parole
        </h2>

        <ToastContainer />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inmate Search Field */}
          <div>
            <label className="block text-gray-700">
              Search Inmate by Name or ID
            </label>
            <input
              type="text"
              placeholder="Enter inmate ID or full name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Show filtered inmates as clickable list */}
          {filteredInmates.length > 0 && (
            <div className="bg-white border rounded-md max-h-40 overflow-y-auto shadow-md">
              {filteredInmates.map((inmate) => (
                <div
                  key={inmate._id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedInmate(inmate);
                    setSearchQuery(
                      `${inmate.firstName} ${inmate.lastName} (ID: ${inmate.inmateID})`
                    );
                    setFilteredInmates([]); // Hide results
                  }}
                >
                  {inmate.firstName} {inmate.lastName} (ID: {inmate.inmateID})
                </div>
              ))}
            </div>
          )}

          {/* Selected Inmate Display */}
          {selectedInmate && (
            <p className="text-sm text-green-600">
              Selected Inmate: {selectedInmate.firstName}{" "}
              {selectedInmate.lastName} (ID: {selectedInmate.inmateID})
            </p>
          )}

          {/* Hearing Date */}
          <div>
            <label className="block text-gray-700">Hearing Date</label>
            <input
              type="date"
              value={hearingDate}
              onChange={(e) => setHearingDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ParoleForm;
