/**
 * @file TopNavbar.js
 * @description Displays a top navigation bar with user role icon, title, description, and notification alerts.
 * @module components/TopNavbar
 *
 * This component:
 * - Fetches and displays parole hearing notifications.
 * - Provides a dropdown menu for alerts with animated transitions.
 * - Dynamically adjusts the displayed user role icon.
 *
 * Features:
 * - Uses `Framer Motion` for smooth dropdown animations.
 * - Fetches real-time parole hearing notifications from the backend.
 * - Displays a bell icon with an alert count when new notifications arrive.
 *
 * @requires react - React library for UI rendering.
 * @requires axios - Library for making HTTP requests.
 * @requires react-icons - Provides icons for better UX.
 * @requires framer-motion - Animation library for dropdown effects.
 */

import React, { useState, useEffect } from "react";
import { FaBell, FaUserShield, FaUserCog, FaTimes } from "react-icons/fa"; // Added Close Icon
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

/**
 * TopNavbar Component
 * -------------------
 * - Displays the page title, user role, and notifications.
 * - Fetches parole hearing alerts dynamically.
 *
 * @component
 * @param {string} role - The role of the user (warden/admin).
 * @param {string} title - The title of the current page.
 * @param {string} description - The description of the page's purpose.
 * @returns {JSX.Element} - The top navigation bar UI component.
 */
const TopNavbar = ({ role, title, description }) => {
  const [notifications, setNotifications] = useState([]); // Stores fetched parole notifications
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls dropdown visibility
  const [visibleCount, setVisibleCount] = useState(5); // Shows only 5 items initially
  const [dropdownHeight, setDropdownHeight] = useState("max-h-[320px]"); // Default dropdown height

  // Select appropriate icon based on user role
  const RoleIcon = role === "warden" ? FaUserShield : FaUserCog;

  /**
   * Fetch Parole Notifications
   * --------------------------
   * - Calls the API to retrieve upcoming parole hearings.
   */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/paroles/upcoming`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching upcoming parole notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Function to handle expanding the dropdown
  const handleLoadMore = () => {
    if (visibleCount + 5 < notifications.length) {
      setVisibleCount(visibleCount + 5);
      setDropdownHeight("max-h-[500px]"); // Expand height to fit more items
    } else {
      setVisibleCount(notifications.length);
      setDropdownHeight("max-h-[80vh]"); // Limit expansion to 80% of the screen
    }
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-md px-6 py-4 sticky w-full top-0 z-50">
      {/* Page Title & Description */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="flex items-center space-x-5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative text-gray-700 hover:text-blue-600"
          >
            <FaBell className="text-2xl" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown with Motion */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute right-0 mt-3 bg-white shadow-lg rounded-lg w-80 p-4 z-50 border border-gray-300 transition-all duration-300 ${dropdownHeight} overflow-y-auto`}
              >
                {/* Dropdown Header with Close Button */}
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Upcoming Parole Hearings
                  </h3>
                  <button onClick={() => setIsDropdownOpen(false)}>
                    <FaTimes className="text-gray-500 hover:text-red-500" />
                  </button>
                </div>

                {/* Notification List */}
                {notifications.length > 0 ? (
                  <>
                    <ul className="mt-2 space-y-2">
                      {notifications.slice(0, visibleCount).map((notif) => (
                        <motion.li
                          key={notif._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-gray-600 text-sm bg-gray-100 px-3 py-2 rounded-md shadow-sm border-l-4 border-blue-500"
                        >
                          {/* Inmate Name & ID */}
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800">
                              {notif.inmate?.firstName || "Unknown"}{" "}
                              {notif.inmate?.lastName || ""}
                            </span>
                            <span className="text-xs text-gray-500 font-semibold">
                              ID: {notif.inmate?.inmateID || "N/A"}
                            </span>
                          </div>

                          {/* Parole Hearing Date */}
                          <p className="text-gray-700 text-sm mt-1">
                            Parole hearing on{" "}
                            <span className="font-semibold">
                              {new Date(notif.hearingDate).toLocaleDateString()}
                            </span>
                          </p>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Load More Button */}
                    {visibleCount < notifications.length && (
                      <button
                        onClick={handleLoadMore}
                        className="mt-4 w-full text-blue-600 hover:underline text-sm text-center"
                      >
                        Load More
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm text-center mt-2">
                    No upcoming parole hearings
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Role Icon */}
        <div className="relative flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <RoleIcon className="text-blue-600 text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
