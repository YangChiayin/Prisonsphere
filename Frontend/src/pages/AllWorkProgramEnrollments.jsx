/**
 * @file AllWorkProgramEnrollments.jsx
 * @description Displays all active and completed work program enrollments.
 * @module pages/AllWorkProgramEnrollments
 *
 * Features:
 * - Lists all inmates assigned to work programs.
 * - Shows start and completion dates, performance ratings, and status.
 * - Filters active vs. completed work programs.
 *
 * @requires react - React library for UI rendering.
 * @requires axios - HTTP client for API communication.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import PagesNavLayout from "../layouts/PagesNavLayout";
import ProfileImgPlaceholder from "../assets/images/ProfilePlaceholder.png";
import { Rating, ThinStar } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

const AllWorkProgramEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "active", "completed"
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchWorkProgramEnrollments();
  }, [filter, currentPage]);

  const fetchWorkProgramEnrollments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/prisonsphere/work-programs/enrollments?page=${currentPage}&limit=${limit}&status=${filter}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setEnrollments(response.data.enrollments);
      setTotalPages(response.data.totalPages);
      setTotalEnrollments(response.data.totalEnrollments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching work program enrollments:", error);
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
    <PagesNavLayout>
      <div className="p-6 bg-white rounded-lg shadow">
        {/* Filter Tabs */}
        <div className="mt-4 flex space-x-4">
          {["all", "active", "completed"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg ${
                filter === status ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Work Program Table */}
        <div className="mt-6">
          {loading ? (
            <p>Loading enrollments...</p>
          ) : enrollments.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Inmate</th>
                  <th className="p-2">Program</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Start Date</th>
                  <th className="p-2">Completion Date</th>
                  <th className="p-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="border-b">
                    {/* Inmate Profile & ID */}
                    <td className="p-2 flex items-center space-x-3">
                      <img
                        src={
                          enrollment.inmateId?.profileImage ||
                          ProfileImgPlaceholder
                        }
                        alt="Profile"
                        className="w-10 h-10 object-cover rounded-full"
                      />
                      <div>
                        <p className="font-semibold">
                          {enrollment.inmateId?.inmateID}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {enrollment.inmateId?.firstName}{" "}
                          {enrollment.inmateId?.lastName}
                        </p>
                      </div>
                    </td>

                    {/* Program */}
                    <td className="p-2">{enrollment.workProgramId?.name}</td>

                    {/* Status */}
                    <td className="p-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          enrollment.status === "Active"
                            ? "bg-green-200 text-green-700"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="p-2">
                      {new Date(enrollment.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {enrollment.endDate
                        ? new Date(enrollment.endDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* Performance */}
                    <td className="p-2">
                      <Rating
                        value={parseFloat(enrollment.performanceRating) || 0}
                        items={5}
                        spaceBetween="small"
                        itemStyles={myStyles}
                        style={{ maxWidth: 150 }}
                        readOnly={true}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No work program enrollments found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6 pt-4">
          <span className="text-gray-700">
            Showing {totalEnrollments > 0 ? (currentPage - 1) * limit + 1 : 0}{" "}
            to {Math.min(currentPage * limit, totalEnrollments)} of{" "}
            {totalEnrollments} entries
          </span>

          <div className="flex space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
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
                onClick={() => setCurrentPage(index + 1)}
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
              onClick={() => setCurrentPage(currentPage + 1)}
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
      </div>
    </PagesNavLayout>
  );
};

export default AllWorkProgramEnrollments;
