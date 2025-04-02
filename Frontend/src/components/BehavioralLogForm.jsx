/**
 * @file BehavioralLogForm.jsx
 * @description Form for logging inmate behavioral performance in work programs.
 * @module components/BehavioralLogForm
 *
 * Features:
 * - Logs work ethic, cooperation, incidents, and social skills.
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
import { Rating, ThinStar } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BehavioralLogForm = ({ inmateId, workProgramId, onClose }) => {
  const [formData, setFormData] = useState({
    workEthic: 3,
    cooperation: 3,
    incidentReports: 0,
    socialSkills: 3,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle star rating change
  const handleStarChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Handle slider change for incident severity
  const handleSliderChange = (e) => {
    setFormData({ ...formData, incidentReports: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/behavior-logs`,
        {
          inmateId,
          workProgramId,
          ...formData,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // If response contains a message about no active program, show correct toast
      if (response.data.message.includes("Inmate must be enrolled")) {
        toast.error(response.data.message);
        return;
      }

      toast.success("Behavioral log recorded successfully!");
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
        toast.error("⚠ Failed to log behavior. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  //stars style
  const myStyles = {
    itemShapes: ThinStar,
    activeFillColor: "#ffd700",
    inactiveFillColor: "#828282",
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
          Log Behavioral Report
        </h2>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Work Ethic */}
          <div className="flex items-center">
            <label className="block">Work Ethic: </label>
            <Rating
              value={formData.workEthic}
              onChange={(value) => handleStarChange("workEthic", value)}
              items={5}
              spaceBetween="small"
              itemStyles={myStyles}
              style={{ maxWidth: 150 }}
            />
          </div>

          {/* Cooperation */}
          <div className="flex items-center">
            <label className="block">Cooperation: </label>
            <Rating
              value={formData.cooperation}
              onChange={(value) => handleStarChange("cooperation", value)}
              items={5}
              spaceBetween="small"
              itemStyles={myStyles}
              style={{ maxWidth: 150 }}
            />
          </div>

          {/* Incident Severity Slider */}
          <div>
            <label className="block">Incident Severity</label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.incidentReports}
              onChange={handleSliderChange}
              className="w-full"
            />
            <p className="text-gray-700 text-sm">
              {formData.incidentReports === "0"
                ? "No Incident"
                : formData.incidentReports < 4
                ? "Minor Incident"
                : formData.incidentReports < 7
                ? "Moderate Incident"
                : "Critical Incident"}
            </p>
          </div>

          {/* Social Skills */}
          <div className="flex items-center">
            <label className="block">Social Skills: </label>
            <Rating
              value={formData.socialSkills}
              onChange={(value) => handleStarChange("socialSkills", value)}
              items={5}
              spaceBetween="small"
              itemStyles={myStyles}
              style={{ maxWidth: 150 }}
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
              {loading ? "Submitting..." : "Log Behavior"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default BehavioralLogForm;
