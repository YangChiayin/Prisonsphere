/**
 * @file WorkProgramAssignmentForm.jsx
 * @description Form for assigning an inmate to a work program.
 * @module components/WorkProgramAssignmentForm
 *
 * Features:
 * - Allows searching for inmates dynamically.
 * - Provides a dropdown to select available work programs.
 * - Sets start and end dates for the assignment.
 * - Submits the assignment to the backend API.
 *
 * @requires react - React library for UI rendering.
 * @requires axios - HTTP client for API communication.
 * @requires framer-motion - Animation library for smooth UI transitions.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WorkProgramAssignmentForm = ({ onClose }) => {
  // **State Variables**
  const [inmates, setInmates] = useState([]); // Stores fetched inmates
  const [filteredInmates, setFilteredInmates] = useState([]); // Filtered results
  const [searchQuery, setSearchQuery] = useState(""); // Inmate search input
  const [selectedInmate, setSelectedInmate] = useState(null); // Stores selected inmate
  const [workPrograms, setWorkPrograms] = useState([]); // Stores fetched work programs
  const [formData, setFormData] = useState({
    workProgramId: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false); // Submission state
  const [errorMessage, setErrorMessage] = useState(""); // Error handling

  /**
   * Fetch inmates & work programs on component mount.
   */
  useEffect(() => {
    fetchInmates();
    fetchWorkPrograms();
  }, []);

  /**
   * Fetches inmates from the backend.
   */
  const fetchInmates = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/inmates`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setInmates(response.data.inmates || []);
    } catch (error) {
      console.error("Error fetching inmates:", error);
    }
  };

  /**
   * Fetches available work programs from the backend.
   */
  const fetchWorkPrograms = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/work-programs`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setWorkPrograms(response.data);
    } catch (error) {
      console.error("Error fetching work programs:", error);
    }
  };

  /**
   * Filters inmates based on search input.
   */
  useEffect(() => {
    if (!searchQuery) {
      setFilteredInmates([]); // Hide results if empty
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
   * Handles form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (
      !selectedInmate ||
      !formData.workProgramId ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast.error("⚠ Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // Check inmate's status before assigning a work program
      const inmateResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/inmates/${
          selectedInmate._id
        }`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const { status } = inmateResponse.data;

      // Prevent assignment if inmate is not incarcerated
      if (status !== "Incarcerated") {
        toast.error(
          "⚠ Work program assignment denied. This inmate is not incarcerated."
        );
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/work-programs/enrollments`,
        {
          inmateId: selectedInmate._id,
          ...formData,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // If response contains a message about no a current enrollment, show correct toast
      if (response.data.message.includes("Inmate is already enrolled")) {
        toast.error(response.data.message);
        return;
      }

      toast.success("Inmate assigned to work program successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      //  Handle error safely without console log spamming
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("⚠ Failed to assign inmate. Please try again.");
      }
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
          Assign Inmate to Work Program
        </h2>

        {/* Error Message */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

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

          {/* Show filtered inmates */}
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

          {/* Work Program Selection */}
          <div>
            <label className="block text-gray-700">Select Work Program</label>
            <select
              name="workProgramId"
              value={formData.workProgramId}
              onChange={(e) =>
                setFormData({ ...formData, workProgramId: e.target.value })
              }
              required
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select a work program</option>
              {workPrograms.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.name} - {program.description}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date & End Date */}
          <div>
            <label className="block text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
              className="w-full p-2 border rounded-lg"
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
              {loading ? "Assigning..." : "Assign Program"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default WorkProgramAssignmentForm;
