import React from "react";
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
}) => {
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
          <div className="overflow-x-auto">
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
                  filteredInmates.map((inmate) => (
                    <tr
                      key={inmate._id}
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
                        <button className="px-2 py-1 text-gray-600 border rounded-md text-sm hover:bg-gray-100 transition">
                          View
                        </button>
                        <button
                          onClick={() => onEdit(inmate)}
                          className="px-2 py-1 text-blue-600 border rounded-md text-sm hover:bg-blue-50 transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!searchQuery && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                Showing {startRecord} to {endRecord} of {totalInmates} entries
              </p>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
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
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
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
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
                    page === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InmateList;
