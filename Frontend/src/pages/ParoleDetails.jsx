/**
 * @file ParoleDetails.js
 * @description Displays detailed information about a parole application.
 * @module components/ParoleDetails
 *
 * This component:
 * - Fetches and displays detailed information about a parole application.
 * - Provides options to approve or deny a parole request.
 * - Ensures parole decisions include a required decision note.
 * - Uses toast notifications for feedback on actions.
 *
 * @requires react - React library for component-based UI.
 * @requires axios - HTTP client for making API requests.
 * @requires react-router-dom - Provides navigation capabilities.
 * @requires react-toastify - Notification library for user feedback.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PagesNavLayout from "../layouts/PagesNavLayout";
import ProfileImgPlaceholder from "../assets/images/ProfilePlaceholder.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineArrowLeft, AiOutlineEdit } from "react-icons/ai";

/**
 * @component ParoleDetails
 * @description Displays details of a parole application, including inmate information and decision options.
 *
 * @returns {JSX.Element} - Renders the parole details UI.
 */
const ParoleDetails = () => {
  const { paroleId } = useParams(); // Get parole ID from URL
  const navigate = useNavigate();
  const [parole, setParole] = useState(null); // Stores parole details
  const [loading, setLoading] = useState(true); // Indicates loading state
  const [decisionNotes, setDecisionNotes] = useState(""); // Stores decision notes
  const [processing, setProcessing] = useState(false); // Indicates if a decision is being processed

  /**
   * Fetches detailed parole information based on `paroleId`.
   * Runs on initial component mount.
   */
  useEffect(() => {
    const fetchParoleDetails = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/prisonsphere/paroles/${paroleId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setParole(response.data);
        setDecisionNotes(response.data.decisionNotes || "");
      } catch (error) {
        console.error("Error fetching parole details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParoleDetails();
  }, [paroleId]);

  /**
   * Handles parole status update (Approve/Deny).
   * Ensures decision notes are provided before submission.
   *
   * @param {String} newStatus - The new status of the parole application ("Approved" or "Denied").
   */
  const handleParoleDecision = async (newStatus) => {
    if (!decisionNotes.trim()) {
      toast.error("⚠ Please provide a decision note.");
      return;
    }

    try {
      setProcessing(true);
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/paroles/${paroleId}`,
        { status: newStatus, decisionNotes },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(`Parole ${newStatus} successfully!`);

      // Refresh Data after action
      setTimeout(() => {
        navigate("/paroles");
        window.location.reload(); // Ensures latest data
      }, 1000);
    } catch (error) {
      toast.error("⚠ Error processing parole decision.");
      console.error("Error updating parole status:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-center">Loading...</p>;

  return (
    <PagesNavLayout>
      <ToastContainer />
      <div className="w-full h-screen bg-white p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Parole Details
          </h2>
          <button
            onClick={() => navigate("/paroles")}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
          >
            <AiOutlineArrowLeft className="mr-2" /> Back to List
          </button>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inmate Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Inmate Information</h3>
            <div className="flex items-center space-x-4">
              <img
                src={parole.inmate?.profilePicture || ProfileImgPlaceholder}
                alt="Inmate Profile"
                className="w-16 h-16 object-cover rounded-full"
              />
              <div>
                <p className="text-lg font-semibold">
                  {parole.inmate?.firstName} {parole.inmate?.lastName}
                </p>
                <p className="text-gray-600 text-sm">
                  Inmate ID: {parole.inmate?.inmateID}
                </p>
                <p className="text-gray-500 text-sm">
                  Admitted:{" "}
                  {new Date(parole.inmate?.admissionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Parole Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Parole Details</h3>
            </div>

            <p className="mt-3">
              <strong>Hearing Date:</strong>{" "}
              {parole.hearingDate
                ? new Date(parole.hearingDate).toLocaleDateString()
                : "Not Set"}
            </p>

            <p>
              <strong>Decision Status:</strong>{" "}
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  parole.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : ""
                } ${
                  parole.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : ""
                } ${
                  parole.status === "Denied" ? "bg-red-100 text-red-700" : ""
                }`}
              >
                {parole.status}
              </span>
            </p>

            {/* Decision Notes (Only when Pending) */}
            {parole.status === "Pending" && (
              <div className="mt-4">
                <label className="block font-medium text-gray-700">
                  Decision Notes
                </label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full p-2 border rounded-md text-gray-700 shadow-sm"
                  placeholder="Provide reason for approval/denial..."
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {parole.status === "Pending" && (
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => handleParoleDecision("Denied")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={processing}
            >
              {processing ? "Processing..." : "Deny Parole"}
            </button>
            <button
              onClick={() => handleParoleDecision("Approved")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={processing}
            >
              {processing ? "Processing..." : "Approve Parole"}
            </button>
          </div>
        )}
      </div>
    </PagesNavLayout>
  );
};

export default ParoleDetails;
