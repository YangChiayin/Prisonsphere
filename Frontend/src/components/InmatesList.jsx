/**
 * @file InmateList.js
 * @description Displays a paginated and searchable table of inmates.
 * @module components/InmateList
 *
 * This component:
 * - Lists all inmates with profile images and details.
 * - Supports pagination, filtering, and searching.
 * - Provides "View" and "Edit" actions.
 * - Dynamically adjusts UI based on `actionType` (inmates or visitors).
 *
 * @requires react - React library for UI components.
 * @requires framer-motion - Animation library for smooth transitions.
 * @requires react-router-dom - Provides navigation capabilities.
 */

/**
 * @component InmateList
 * @description Displays a table of inmates with profile images and actions.
 *
 * @param {Object} props - Component properties.
 * @param {Array} props.inmates - List of inmate objects.
 * @param {Boolean} props.loading - Indicates if data is being loaded.
 * @param {Number} props.page - Current page number for pagination.
 * @param {Number} props.totalPages - Total number of pages available.
 * @param {Function} props.setPage - Function to update the current page.
 * @param {Number} props.totalInmates - Total count of inmates in the system.
 * @param {Number} props.limit - Number of records per page.
 * @param {String} props.searchQuery - Query string used for filtering inmates.
 * @param {Function} props.onEdit - Callback function when the "Edit" button is clicked.
 * @param {String} [props.actionType="inmate"] - Determines if the list is for "inmate" or "visitor" actions.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProfileImgPlacehoder from "../assets/images/ProfilePlaceholder.png";

const InmateList = ({
  inmates,
  loading,
  page,
  totalPages,
  setPage,
  totalInmates,
  limit,
  searchQuery,
  onEdit,
  actionType = "inmate", // "inmate" (default) or "visitor"
}) => {
  const navigate = useNavigate();

  // Calculate the start and end record numbers dynamically
  const startRecord = totalInmates > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = totalInmates > 0 ? Math.min(page * limit, totalInmates) : 0;

  // Filter inmates based on searchQuery
  const filteredInmates = searchQuery
    ? inmates.filter(
        (inmate) =>
          inmate.inmateID.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${inmate.firstName} ${inmate.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : inmates;

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <motion.div
            key={page} // Ensures reanimation on page change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold">
                  <th className="p-3">Profile</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Inmate ID</th>
                  <th className="p-3">Admission Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInmates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No inmates registered.
                    </td>
                  </tr>
                ) : (
                  filteredInmates.map((inmate, index) => (
                    <motion.tr
                      key={inmate._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: "#f9fafb",
                        boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.05)",
                      }}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="p-3">
                        <img
                          src={inmate.profileImage || ProfileImgPlacehoder}
                          alt="Profile"
                          className="w-10 h-10 object-cover rounded-full"
                        />
                      </td>
                      <td className="p-3">
                        {inmate.firstName} {inmate.lastName}
                      </td>
                      <td className="p-3">{inmate.inmateID}</td>
                      <td className="p-3">
                        {new Date(inmate.admissionDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-sm font-medium ${
                            inmate.status === "Incarcerated"
                              ? "text-red-600"
                              : inmate.status === "Parole"
                              ? "text-yellow-500"
                              : "text-green-600"
                          }`}
                        >
                          {inmate.status}
                        </span>
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() =>
                            actionType === "visitor"
                              ? navigate(`/visitors/history/${inmate._id}`)
                              : navigate(`/inmates/view/${inmate._id}`)
                          }
                          className="px-2 py-1 text-gray-600 border rounded-md text-sm hover:bg-gray-100 transition cursor-pointer"
                        >
                          View
                        </button>
                        {actionType === "inmate" && (
                          <button
                            onClick={() => onEdit(inmate)}
                            className="px-2 py-1 text-blue-600 border rounded-md text-sm hover:bg-blue-50 transition cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Pagination Controls */}
          {!searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-between"
            >
              <p className="text-gray-500 text-sm">
                Showing {startRecord} to {endRecord} of {totalInmates} entries
              </p>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition cursor-pointer ${
                    page === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(index + 1)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition cursor-pointer ${
                      page === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition cursor-pointer ${
                    page === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default InmateList;
