import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoSearch } from "react-icons/io5";

const InmateSearch = ({ onSelectInmate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInmates, setFilteredInmates] = useState([]);
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Inmates from API
  useEffect(() => {
    const fetchInmates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/prisonsphere/inmates",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setInmates(response.data.inmates || []);
      } catch (error) {
        console.error("Error fetching inmates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInmates();
  }, []);

  // Filter inmates based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredInmates([]);
      return;
    }

    const filtered = inmates.filter(
      (inmate) =>
        inmate.inmateID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${inmate.firstName} ${inmate.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    setFilteredInmates(filtered);
  }, [searchQuery, inmates]);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white shadow-sm">
        <IoSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search by Name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* Search Results Dropdown */}
      {filteredInmates.length > 0 && (
        <div className="absolute w-full mt-2 bg-white border rounded-lg shadow-md max-h-60 overflow-y-auto z-50">
          {filteredInmates.map((inmate) => (
            <div
              key={inmate._id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => {
                onSelectInmate(inmate);
                setSearchQuery(
                  `${inmate.firstName} ${inmate.lastName} (ID: ${inmate.inmateID})`
                );
                setFilteredInmates([]); // Hide results after selection
              }}
            >
              <span>
                {inmate.firstName} {inmate.lastName} (ID: {inmate.inmateID})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <p className="text-gray-500 text-sm mt-1">Loading inmates...</p>
      )}
    </div>
  );
};

export default InmateSearch;
