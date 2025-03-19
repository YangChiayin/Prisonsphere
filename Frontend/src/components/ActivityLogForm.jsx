/**
 * @file ActivityLogForm.jsx
 * @description Form for logging inmate activities in work programs.
 * @module components/ActivityLogForm
 *
 * Features:
 * - Logs counseling, work performance, and educational sessions.
 * - Submits data to the backend API.
 * - Matches modern modal UI styling for consistency.
 *
 * @requires react - React library for UI rendering.
 * @requires axios - HTTP client for API communication.
 * @requires framer-motion - Animation library for smooth UI transitions.
 */

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ActivityLogForm = ({ inmateId, onClose }) => {
  const [formData, setFormData] = useState({
    activityType: "Counseling",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await axios.post(
        "http://localhost:5000/prisonsphere/activity-logs",
        {
          inmateId,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Activity logged successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      toast.error("⚠ Failed to log activity. Please try again.");
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Log Inmate Activity
        </h2>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Activity Type</label>
            <select
              name="activityType"
              value={formData.activityType}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-gray-50 hover:bg-gray-100"
            >
              <option value="Counseling">Counseling</option>
              <option value="Education">Education</option>
              <option value="Conflict">Conflict Resolution</option>
              <option value="Recreation">Recreation</option>
              <option value="Health Session">Health Session</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md bg-gray-50 hover:bg-gray-100"
              placeholder="Enter activity details..."
            />
          </div>

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
              {loading ? "Submitting..." : "Log Activity"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default ActivityLogForm;
