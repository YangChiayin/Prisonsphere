/**
 * @file VisitorDetails.js
 * @description Displays detailed information about a specific visitor, including visit history, purpose, and duration.
 * @module pages/VisitorDetails
 *
 * This component:
 * - Fetches and displays detailed visitor information.
 * - Allows users to edit visitor details using a form modal.
 *
 * Features:
 * - Uses `useParams` to dynamically retrieve visitor data based on ID.
 * - Fetches visitor details from the backend API.
 * - Displays formatted visit timestamps and duration.
 * - Implements a modal-based edit form.
 *
 * @requires react - React library for UI rendering.
 * @requires react-router-dom - Library for managing dynamic routes.
 * @requires axios - Library for making HTTP requests.
 * @requires react-icons - Provides icons for better UI experience.
 * @requires PagesNavLayout - Layout wrapper including sidebar and top navbar.
 * @requires VisitorForm - Component for editing visitor details.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PagesNavLayout from "../layouts/PagesNavLayout";
import VisitorForm from "../components/VisitorForm";
import {
  AiOutlineArrowLeft,
  AiOutlineMail,
  AiOutlinePhone,
} from "react-icons/ai";
import { MdAccessTime, MdEvent, MdModeEdit } from "react-icons/md";

/**
 * VisitorDetails Component
 * ------------------------
 * - Displays a visitor's details, including visit purpose, duration, and notes.
 * - Allows users to edit visitor information via a form modal.
 *
 * @component
 * @returns {JSX.Element} - The visitor details page UI component.
 */
const VisitorDetails = () => {
  const { visitorId } = useParams(); // **Extracts visitor ID from URL params**
  const navigate = useNavigate(); // **Handles navigation within the app**
  const [visitor, setVisitor] = useState(null); // **Stores visitor details**
  const [loading, setLoading] = useState(true); // **Indicates loading state**
  const [showForm, setShowForm] = useState(false); // **Toggles edit modal visibility*

  /**
   * Fetches visitor details from the backend.
   */
  useEffect(() => {
    const fetchVisitorDetails = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/prisonsphere/visitors/details/${visitorId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setVisitor(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching visitor details:", error);
        setLoading(false);
      }
    };
    fetchVisitorDetails();
  }, [visitorId]);

  /**
   * Refreshes visitor details after an update.
   */
  const handleFormSuccess = () => {
    setShowForm(false);
    // Fetch updated visitor details
    const refreshVisitor = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/prisonsphere/visitors/details/${visitorId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setVisitor(response.data);
      } catch (error) {
        console.error("Error refreshing visitor details:", error);
      }
    };
    refreshVisitor();
  };

  if (loading) {
    return (
      <PagesNavLayout>
        <p className="text-gray-500">Loading visitor details...</p>
      </PagesNavLayout>
    );
  }

  if (!visitor) {
    return (
      <PagesNavLayout>
        <p className="text-gray-500">Visitor not found.</p>
      </PagesNavLayout>
    );
  }

  return (
    <PagesNavLayout>
      <div className="space-y-6">
        {/* Back to List Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition"
        >
          <AiOutlineArrowLeft className="mr-2" /> Back to List
        </button>

        {/* Visitor Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-md flex space-x-6">
          {/* Left Side: Visitor Profile */}
          <div className="w-1/3 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {visitor.visitorName}
            </h2>
            <p className="text-sm text-gray-500">
              {visitor.relationshipToInmate}
            </p>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p className="flex items-center">
                <AiOutlinePhone className="text-blue-600 mr-2" />{" "}
                {visitor.contactNumber}
              </p>
              <p className="flex items-center">
                <AiOutlineMail className="text-blue-600 mr-2" /> {visitor.email}
              </p>
            </div>
          </div>

          {/* Right Side: Styled Visit Information */}
          <div className="w-2/3 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Visit Details
              </h3>
              <button
                onClick={() => setShowForm(true)} // Open Edit Form
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
              >
                <MdModeEdit className="mr-2" /> Edit Details
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p className="flex items-center">
                <MdEvent className="text-blue-600 mr-2" />{" "}
                <strong>Visit Date & Time:</strong>{" "}
                {new Date(visitor.visitTimestamp).toLocaleString()}
              </p>
              <p className="flex items-center">
                <MdAccessTime className="text-blue-600 mr-2" />{" "}
                <strong>Duration:</strong> {visitor.durationMinutes} minutes
              </p>
              <p>
                <strong>Purpose of Visit:</strong> {visitor.purposeOfVisit}
              </p>
              <div className="bg-gray-100 p-3 rounded-md">
                <strong>Staff Notes:</strong> <br />
                {visitor.staffNotes || "No notes provided"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show VisitorForm modal when needed */}
      {showForm && (
        <VisitorForm
          inmateId={visitor.inmate} // Pass inmate ID
          visitorData={visitor} //  Prefill form with visitor data
          onClose={() => setShowForm(false)}
          onFormSuccess={handleFormSuccess}
        />
      )}
    </PagesNavLayout>
  );
};

export default VisitorDetails;
