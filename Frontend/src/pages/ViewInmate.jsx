/**
 * @file ViewInmate.js
 * @description Displays detailed information about an inmate, including personal details,
 * visitation history, parole records, work program status, behavioral and activity logs.
 * Allows users to edit inmate details and add logs.
 *
 * @module pages/ViewInmate
 *
 * Features:
 * - Fetches inmate details dynamically using `useParams` (React Router).
 * - Displays:
 *   Personal Information (Name, ID, Status, Cell Block)
 *   Work Program Status (Current Work Assignment)
 *   Behavioral Logs (Work Ethic, Incident Reports, Cooperation)
 *   Activity Logs (Education, Counseling, Work Performance)
 *   Parole & Visitation History
 * - Supports:
 *   Editing inmate details via a modal form.
 *   Pagination for activity logs.
 *   Adding behavioral and activity logs.
 *
 * @requires react - React for state management and UI rendering.
 * @requires react-router-dom - Manages route parameters and navigation.
 * @requires axios - API requests for fetching inmate details and related logs.
 * @requires react-icons - Provides UI icons.
 * @requires PagesNavLayout - Layout wrapper with sidebar and top navbar.
 * @requires InmateForm - Component for editing inmate details.
 * @requires BehavioralLogForm - Component for adding behavior logs.
 * @requires ActivityLogForm - Component for adding activity logs.
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { Rating, ThinStar } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { MdEdit } from "react-icons/md";
import ProfilePlaceholder from "../assets/images/ProfilePlaceholder.png";
import PagesNavLayout from "../layouts/PagesNavLayout";
import InmateForm from "../components/InmateForm";
import BehavioralLogForm from "../components/BehavioralLogForm";
import ActivityLogForm from "../components/ActivityLogForm";
import { formatDistanceToNow, format } from "date-fns";

/**
 * ViewInmate Component
 * --------------------
 * - Displays inmate profile with visitation and parole history.
 * - Allows users to edit inmate details and add logs.
 *
 * @component
 * @returns {JSX.Element} - Inmate details page UI component.
 */
const ViewInmate = () => {
  const { id } = useParams(); // Extracts inmate ID from URL params
  const navigate = useNavigate(); // Handles navigation within the app

  // Inmate Profile & Related Data
  const [inmate, setInmate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [paroleHistory, setParoleHistory] = useState([]);
  const [workProgram, setWorkProgram] = useState(null);
  const [behavioralLogs, setBehavioralLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // UI State
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState("visitation");
  const [showBehaviorLogForm, setShowBehaviorLogForm] = useState(false);
  const [showActivityLogForm, setShowActivityLogForm] = useState(false);

  // Pagination for activity logs
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivityLogs, setTotalActivityLogs] = useState(0);

  /**
   * Fetches inmate details from the backend.
   */
  const fetchInmateDetails = async () => {
    try {
      setLoading(true);
      const inmateResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/inmates/${id}`,
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
   * Fetches inmate workProgram from the backend.
   */
  const fetchWorkProgram = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/work-programs/enrollments/inmate/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Find the ACTIVE work program
      const activeProgram = response.data.find(
        (program) => program.status === "Active"
      );

      if (!activeProgram) {
        setWorkProgram(null); // No active work program found
      } else {
        setWorkProgram(activeProgram);
      }
    } catch (error) {
      console.error("Error fetching work program:", error);
      setWorkProgram(null);
    }
  };

  /**
   * Fetches inmate behavioralLog from the backend.
   */
  const fetchBehavioralLogs = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/behavior-logs/inmate/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.message === "No behavioral log found.") {
        setBehavioralLogs([]); // No log exists, set to null
      } else {
        setBehavioralLogs(response.data || []); // Store the single object
      }
    } catch (error) {
      console.error("Error fetching behavioral logs:", error);
      setBehavioralLogs([]); // Ensure UI handles missing logs
    }
  };
  /**
   * Fetches inmate activityLog from the backend.
   */
  const fetchActivityLogs = async (page = 1) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/activity-logs/inmate/${id}?page=${page}&limit=2`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setActivityLogs(response.data.logs);
      setTotalActivityLogs(response.data.totalLogs); // Ensure backend returns totalLogs count
      setTotalPages(Math.ceil(response.data.totalLogs / 2));
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  /**
   * Fetches visitation history, parole records, and work programs for the inmate.
   */
  useEffect(() => {
    fetchInmateDetails();
    fetchWorkProgram();
    fetchBehavioralLogs();
    fetchActivityLogs();

    const fetchRelatedData = async () => {
      try {
        const [visitorRes, paroleRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/visitors/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/prisonsphere/paroles/inmate/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);

        setVisitors(visitorRes.data.visitors || []);
        setParoleHistory(paroleRes.data);
      } catch (err) {
        console.error("Error fetching related data:", err);
      }
    };

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

  //stars style
  const myStyles = {
    itemShapes: ThinStar,
    activeFillColor: "#ffd700",
    inactiveFillColor: "#828282",
  };

  return (
    <PagesNavLayout>
      <div className="w-full h-full bg-white shadow-md p-6">
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

          {/* Work Program Section */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold">Work Program Details</h3>

            {workProgram ? (
              <div className="mt-2">
                <p>
                  <strong>Program:</strong>{" "}
                  {workProgram.workProgramId?.name || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {workProgram.status || "N/A"}
                </p>
                <p>
                  <strong>Start Date:</strong>
                  {workProgram.startDate
                    ? new Date(workProgram.startDate).toLocaleDateString()
                    : "Not Assigned"}
                </p>
                <p>
                  <strong>End Date:</strong>
                  {workProgram.endDate
                    ? new Date(workProgram.endDate).toLocaleDateString()
                    : "Not Assigned"}
                </p>
                <p>
                  <strong>Performance Rating:</strong>
                  {workProgram.performanceRating
                    ? `${workProgram.performanceRating} ⭐`
                    : "Not Rated Yet"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                This inmate is not currently enrolled in an active work program.
              </p>
            )}
          </div>
        </div>

        {/* Behavioral Logs Section */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg w-full">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Behavioral Logs</h3>
            <button
              onClick={() => setShowBehaviorLogForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Log Behavior
            </button>
          </div>

          {/* Show Latest Behavioral Log */}
          {behavioralLogs ? (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {/* Work Ethic */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Work Ethic</p>
                <div className="flex items-center">
                  <Rating
                    value={behavioralLogs.workEthic}
                    items={5}
                    spaceBetween="small"
                    itemStyles={myStyles}
                    style={{ maxWidth: 150 }}
                    readOnly={true}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {behavioralLogs.timeAgo}
                </p>
              </div>

              {/* Cooperation */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Cooperation</p>
                <div className="flex items-center">
                  <Rating
                    value={behavioralLogs.cooperation}
                    items={5}
                    spaceBetween="small"
                    itemStyles={myStyles}
                    style={{ maxWidth: 150 }}
                    readOnly={true}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {behavioralLogs.timeAgo}
                </p>
              </div>

              {/* Incident Reports */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Incident Reports</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    !behavioralLogs
                      ? "bg-gray-200 text-gray-600" // Default for no logs
                      : behavioralLogs.incidentReports === 0
                      ? "bg-green-100 text-green-600"
                      : behavioralLogs.incidentReports < 4
                      ? "bg-yellow-100 text-yellow-600"
                      : behavioralLogs.incidentReports < 7
                      ? "bg-orange-100 text-orange-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {!behavioralLogs
                    ? "No Behavioral Logs" //  Show default text if no logs exist
                    : behavioralLogs.incidentReports === 0
                    ? "No Recent Incidents"
                    : behavioralLogs.incidentReports < 4
                    ? "Minor Incident"
                    : behavioralLogs.incidentReports < 7
                    ? "Moderate Incident"
                    : "Critical Incident"}
                </span>

                <p className="text-xs text-gray-500">
                  {behavioralLogs.timeAgo}
                </p>
              </div>

              {/* Social Skills */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Social Skills</p>
                <div className="flex items-center">
                  <Rating
                    value={behavioralLogs.socialSkills}
                    items={5}
                    spaceBetween="small"
                    itemStyles={myStyles}
                    style={{ maxWidth: 150 }}
                    readOnly={true}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {behavioralLogs.timeAgo}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">No behavioral logs recorded.</p>
          )}
        </div>

        {/* Activity Logs Section */}
        <div className="mt-6 p-4 bg-white shadow-sm rounded-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Activity Logs</h3>
            <button
              onClick={() => setShowActivityLogForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + New Log Entry
            </button>
          </div>

          {activityLogs.length > 0 ? (
            <>
              <ul className="space-y-4">
                {activityLogs.map((log, index) => {
                  // Determine color based on activity type
                  const activityColors = {
                    Counseling: "border-l-4 border-blue-500",
                    Work: "border-l-4 border-yellow-500",
                    Education: "border-l-4 border-green-500",
                    Conflict: "border-l-4 border-red-500",
                    Health: "border-l-4 border-purple-700",
                  };

                  // Format date for "Today 10:30 AM" / "2 days ago"
                  const formattedDate = formatDistanceToNow(
                    new Date(log.logDate),
                    { addSuffix: true }
                  );

                  return (
                    <li
                      key={index}
                      className={`p-3 rounded-lg bg-gray-50 shadow-sm flex justify-between ${
                        activityColors[log.activityType] || "border-gray-300"
                      }`}
                    >
                      <div>
                        <span
                          className={`text-sm font-semibold px-2 py-1 rounded-lg bg-opacity-20 ${
                            log.activityType === "Counseling"
                              ? "bg-blue-200 text-blue-700"
                              : log.activityType === "Work"
                              ? "bg-yellow-200 text-yellow-700"
                              : log.activityType === "Education"
                              ? "bg-green-200 text-green-700"
                              : log.activityType === "Conflict"
                              ? "bg-red-200 text-red-700"
                              : "bg-purple-200 text-purple-700"
                          }`}
                        >
                          {log.activityType}
                        </span>
                        <p className="mt-1 text-gray-700">{log.description}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formattedDate}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4 pt-4">
                <span className="text-gray-700">
                  Showing{" "}
                  {Math.min((currentPage - 1) * 2 + 1, totalActivityLogs)} to{" "}
                  {Math.min(currentPage * 2, totalActivityLogs)} of{" "}
                  {totalActivityLogs} entries
                </span>

                <div className="flex space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => fetchActivityLogs(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => fetchActivityLogs(index + 1)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => fetchActivityLogs(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No activity logs recorded.</p>
          )}
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
                            {new Date(v.visitTimestamp).toLocaleDateString(
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

      {/* Forms for Logging Behavior & Activity */}
      {showBehaviorLogForm && (
        <BehavioralLogForm
          inmateId={id}
          workProgramId={workProgram?._id}
          onClose={() => {
            setShowBehaviorLogForm(false);
            fetchBehavioralLogs();
          }}
        />
      )}

      {showActivityLogForm && (
        <ActivityLogForm
          inmateId={id}
          workProgramId={workProgram?._id}
          onClose={() => {
            setShowActivityLogForm(false);
            fetchActivityLogs();
          }}
        />
      )}
    </PagesNavLayout>
  );
};

export default ViewInmate;
