/**
 * @file RehabilitationAndWork.jsx
 * @description Work Program Management UI for PrisonSphere.
 * @module pages/RehabilitationAndWork
 *
 * Features:
 * - Displays active work program for `INM001`.
 * - Shows behavioral logs and latest 3 activity logs.
 * - Allows assigning a new inmate to a work program.
 * - Lists all active work program enrollments.
 *
 * @requires react - React library for UI rendering.
 * @requires axios - HTTP client for API communication.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import PagesNavLayout from "../layouts/PagesNavLayout";
import { useNavigate } from "react-router-dom";
import WorkProgramAssignmentForm from "../components/WorkProgramAssignmentForm";
import { Rating, ThinStar } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import ProfileImgPlaceholder from "../assets/images/ProfilePlaceholder.png";

const RehabilitationAndWork = () => {
  const navigate = useNavigate();
  const [inmate, setInmate] = useState(null);
  const [activeWorkProgram, setActiveWorkProgram] = useState(null);
  const [behavioralLog, setBehavioralLog] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [performanceRating, setPerformanceRating] = useState(0);

  useEffect(() => {
    fetchWorkProgramSample();
  }, []);

  const fetchWorkProgramSample = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/prisonsphere/work-programs/enrollments/display-sample",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setInmate(response.data.inmate || {});
      setActiveWorkProgram(response.data.workProgram || {});
      setPerformanceRating(response.data.performanceRating || 0);
      setBehavioralLog(response.data.behavioralLog);
      setActivityLogs(response.data.activityLogs);
    } catch (error) {
      console.error("Error fetching work program sample:", error);
    }
  };

  //stars style
  const myStyles = {
    itemShapes: ThinStar,
    activeFillColor: "#ffd700",
    inactiveFillColor: "#828282",
  };

  return (
    <PagesNavLayout>
      <div className="p-6 bg-white rounded-lg shadow">
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate("/work-programs/enrollments")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View All Enrollments
          </button>
        </div>

        {/* Work Program Enrollment Section */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work Program Enrollment</h3>
            <button
              onClick={() => setShowAssignmentForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + New Assignment
            </button>
          </div>

          {activeWorkProgram && inmate ? (
            <div className="mt-4 bg-gray-100 rounded-lg">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-sm">
                    <th className="p-3">Profile Img</th>
                    <th className="p-3">Inmate ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Work Type</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">Completion Date</th>
                    <th className="p-3">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    {/* Inmate ID */}
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={inmate.profileImage || ProfileImgPlaceholder}
                          alt="Profile"
                          className="w-10 h-10 object-cover rounded-full"
                        />
                      </div>
                    </td>

                    {/* ID */}
                    <td className="p-3">{inmate.inmateID}</td>
                    {/* Name */}
                    <td className="p-3">{`${inmate.firstName} ${inmate.lastName}`}</td>

                    {/* Work Type */}
                    <td className="p-3">
                      {activeWorkProgram.workProgramId?.name || "N/A"}
                    </td>

                    {/* Start Date */}
                    <td className="p-3">
                      {activeWorkProgram.startDate
                        ? new Date(
                            activeWorkProgram.startDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* Completion Date */}
                    <td className="p-3">
                      {activeWorkProgram.endDate
                        ? new Date(
                            activeWorkProgram.endDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* Performance Rating */}
                    <td className="p-3">
                      <Rating
                        value={performanceRating}
                        items={5}
                        spaceBetween="small"
                        itemStyles={myStyles}
                        style={{ maxWidth: 150 }}
                        readOnly={true}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mt-3">No active work program.</p>
          )}
        </div>

        {/* Behavioral Logs Section */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold">Behavioral Logs</h3>
          {behavioralLog ? (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {/* Work Ethic */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Work Ethic</p>
                <Rating
                  value={behavioralLog.workEthic}
                  items={5}
                  spaceBetween="small"
                  itemStyles={myStyles}
                  style={{ maxWidth: 150 }}
                  readOnly={true}
                />
                <p className="text-xs text-gray-500">
                  {new Date(behavioralLog.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Cooperation */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Cooperation</p>
                <Rating
                  value={behavioralLog.cooperation}
                  items={5}
                  spaceBetween="small"
                  itemStyles={myStyles}
                  style={{ maxWidth: 150 }}
                  readOnly={true}
                />
                <p className="text-xs text-gray-500">
                  {new Date(behavioralLog.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Incident Reports */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Incident Reports</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    behavioralLog.incidentReports === 0
                      ? "bg-green-100 text-green-600"
                      : behavioralLog.incidentReports < 4
                      ? "bg-yellow-100 text-yellow-600"
                      : behavioralLog.incidentReports < 7
                      ? "bg-orange-100 text-orange-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {behavioralLog.incidentReports === 0
                    ? "No Recent Incidents"
                    : behavioralLog.incidentReports < 4
                    ? "Minor Incident"
                    : behavioralLog.incidentReports < 7
                    ? "Moderate Incident"
                    : "Critical Incident"}
                </span>
                <p className="text-xs text-gray-500">
                  {new Date(behavioralLog.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Social Skills */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-600 font-semibold">Social Skills</p>
                <Rating
                  value={behavioralLog.socialSkills}
                  items={5}
                  spaceBetween="small"
                  itemStyles={myStyles}
                  style={{ maxWidth: 150 }}
                  readOnly={true}
                />
                <p className="text-xs text-gray-500">
                  {new Date(behavioralLog.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">No behavioral logs recorded.</p>
          )}
        </div>

        {/* Activity Logs Section */}
        <div className="mt-6 p-4 bg-white shadow-sm rounded-lg">
          <h3 className="text-lg font-semibold">Activity Logs</h3>

          {activityLogs.length > 0 ? (
            <ul className="space-y-4">
              {activityLogs.map((log, index) => (
                <li key={index} className="p-3 rounded-lg bg-gray-50 shadow-sm">
                  <span className="text-sm font-semibold text-blue-600">
                    {log.activityType}
                  </span>
                  <p className="mt-1 text-gray-700">{log.description}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(log.logDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No activity logs recorded.</p>
          )}
        </div>

        {/* Assignment Form */}
        {showAssignmentForm && (
          <WorkProgramAssignmentForm
            onClose={() => setShowAssignmentForm(false)}
          />
        )}
      </div>
    </PagesNavLayout>
  );
};

export default RehabilitationAndWork;
