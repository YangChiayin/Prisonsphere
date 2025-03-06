/**
 * @file ViewInmate.js
 * @description Detailed view page for an inmate, displaying personal information, visitor logs, parole history, and rehabilitation status.
 * @module pages/ViewInmate
 *
 * This component:
 * - Fetches and displays detailed inmate information.
 * - Allows users to view visitation history, parole history, and work programs.
 * - Supports editing inmate details via a modal form.
 *
 * Features:
 * - Uses `useParams` to dynamically retrieve inmate data based on ID.
 * - Fetches additional data related to visitation, parole, and work programs.
 * - Implements tab navigation to switch between inmate-related data.
 * - Supports editing inmate details through a modal form.
 *
 * @requires react - React library for UI rendering.
 * @requires react-router-dom - Library for managing dynamic routes.
 * @requires axios - Library for making HTTP requests.
 * @requires react-icons - Provides icons for better UI experience.
 * @requires PagesNavLayout - Layout wrapper including sidebar and top navbar.
 * @requires InmateForm - Component for editing inmate details.
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import ProfilePlaceholder from "../assets/images/ProfilePlaceholder.png";
import PagesNavLayout from "../layouts/PagesNavLayout";
import InmateForm from "../components/InmateForm";

/**
 * ViewInmate Component
 * --------------------
 * - Displays an inmate's profile with visitation and parole history.
 * - Allows users to edit inmate details.
 *
 * @component
 * @returns {JSX.Element} - The inmate details page UI component.
 */
const ViewInmate = () => {
  const { id } = useParams(); // **Extracts inmate ID from URL params**
  const navigate = useNavigate(); // **Handles navigation within the app**
  const [inmate, setInmate] = useState(null); // **Stores inmate details**
  const [loading, setLoading] = useState(true); // **Indicates loading state**
  const [error, setError] = useState(""); // **Stores error messages**
  const [visitors, setVisitors] = useState([]); // **Stores visitor history**
  const [paroleHistory, setParoleHistory] = useState([]); // **Stores parole records**
  const [workPrograms, setWorkPrograms] = useState([]); // **Stores work programs data**
  const [showEditForm, setShowEditForm] = useState(false); // **Toggles edit modal visibility**
  const [activeTab, setActiveTab] = useState("visitation"); // **Manages active tab state**

  /**
   * Fetches inmate details from the backend.
   */
  const fetchInmateDetails = async () => {
    try {
      setLoading(true);
      const inmateResponse = await axios.get(
        `http://localhost:5000/prisonsphere/inmates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setInmate(inmateResponse.data);
    } catch (err) {
      setError("Failed to fetch inmate details.");
      console.error("Error fetching inmate details:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches visitation history, parole records, and work programs for the inmate.
   */
  useEffect(() => {
    fetchInmateDetails();

    const fetchRelatedData = async () => {
      try {
        const [visitorRes, paroleRes, workRes] = await Promise.all([
          axios.get(`http://localhost:5000/prisonsphere/visitors/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`http://localhost:5000/prisonsphere/paroles/inmate/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(
            `http://localhost:5000/prisonsphere/work-programs/enrollments/inmate/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);

        setVisitors(visitorRes.data);
        setParoleHistory(paroleRes.data);
        setWorkPrograms(workRes.data);
      } catch (err) {
        console.error("Error fetching related data:", err);
      }
    };

    fetchInmateDetails();
    fetchRelatedData();
  }, [id]);

  // Callback function to refresh inmates after register or edit
  const handleFormSuccess = () => {
    fetchInmateDetails(); // Refresh inmate list
  };

  if (loading)
    return (
      <p className="text-center text-gray-600">Loading inmate details...</p>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <PagesNavLayout>
      <div className="w-full h-screen bg-white shadow-md p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <img
              src={inmate.profileImage || ProfilePlaceholder}
              alt="Profile"
              className="w-20 h-20 object-cover rounded-full border"
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {inmate.firstName} {inmate.lastName}
              </h2>
              <p className="text-gray-600">Inmate ID: {inmate.inmateID}</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  inmate.status === "Incarcerated"
                    ? "bg-red-200 text-red-700"
                    : inmate.status === "Parole"
                    ? "bg-yellow-200 text-yellow-700"
                    : inmate.status === "Released"
                    ? "bg-green-200 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {inmate.status}
              </span>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex space-x-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
            >
              <IoArrowBack size={18} className="mr-2" /> Back to List
            </button>

            {/* Edit Button */}
            <button
              onClick={() => setShowEditForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <MdEdit size={18} className="mr-2" /> Edit Details
            </button>
          </div>
        </div>

        {/* Personal Information & Rehabilitation Program */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Personal Information Card */}
          <div className="bg-white shadow-sm rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Personal Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700 text-sm">
                <span>Age</span>
                <span className="font-bold">
                  {new Date().getFullYear() -
                    new Date(inmate.dateOfBirth).getFullYear()}{" "}
                  years
                </span>
              </div>
              <div className="flex justify-between text-gray-700 text-sm">
                <span>Gender</span>
                <span className="font-bold">{inmate.gender}</span>
              </div>
              <div className="flex justify-between text-gray-700 text-sm">
                <span>Cell Block</span>
                <span className="font-bold">
                  {inmate.assignedCell || "Not Assigned"}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 text-sm">
                <span>Admission Date</span>
                <span className="font-bold">
                  {new Date(inmate.admissionDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 text-sm">
                <span>Sentence Duration</span>
                <span className="font-bold">
                  {inmate.sentenceDuration} months
                </span>
              </div>
            </div>
          </div>

          {/* Rehabilitation Program Card */}
          <div className="bg-white shadow-sm rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Current Rehabilitation Program
            </h3>
            <div className="text-gray-700 text-sm">
              {workPrograms.length > 0 ? (
                <p className="font-bold">
                  {workPrograms[0].workProgram.name} (Started:{" "}
                  {new Date(workPrograms[0].startDate).toLocaleDateString()})
                </p>
              ) : (
                <p>No enrolled programs.</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="shadow-sm mt-6">
          {["visitation", "parole"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-semibold ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "visitation" ? "Visitation History" : "Parole History"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "visitation" && (
            <div>
              <h3 className="font-semibold">Visitor Logs</h3>
              {visitors.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg p-5">
                  <ul className="divide-y divide-gray-200">
                    {visitors.map((v) => (
                      <li key={v._id} className="py-3">
                        <div className="flex justify-between items-center">
                          {/* Left Section: Visitor Name & Relationship */}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {v.visitorName}{" "}
                              <span className="text-gray-500">
                                ({v.relationshipToInmate})
                              </span>
                            </p>
                            {v.staffNotes && (
                              <p className="text-xs text-gray-600 mt-1">
                                {v.staffNotes}
                              </p>
                            )}
                          </div>

                          {/* Right Section: Visit Date */}
                          <div className="text-sm text-gray-700">
                            {new Date(v.visitDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">No visitor records available.</p>
              )}
            </div>
          )}

          {activeTab === "parole" && (
            <div>
              <h3 className="font-semibold">Parole History</h3>
              {paroleHistory.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg p-5">
                  <ul className="divide-y divide-gray-200">
                    {paroleHistory.map((p) => (
                      <li key={p._id} className="py-3">
                        <div className="flex justify-between items-center">
                          {/* Left Section: Status & Decision Notes */}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {p.status}
                            </p>
                            {p.decisionNotes && (
                              <p className="text-xs text-gray-600 mt-1">
                                {p.decisionNotes}
                              </p>
                            )}
                          </div>

                          {/* Right Section: Application Date */}
                          <div className="text-sm text-gray-700">
                            {new Date(p.applicationDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">No parole history available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* showEditForm is True */}
      {showEditForm && (
        <InmateForm
          inmateData={inmate}
          onClose={() => setShowEditForm(false)}
          onFormSuccess={handleFormSuccess}
        />
      )}
    </PagesNavLayout>
  );
};

export default ViewInmate;
