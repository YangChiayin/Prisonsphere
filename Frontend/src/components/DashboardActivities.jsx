/**
 * @file DashboardActivities.js
 * @description Displays recent activities logged in the PrisonSphere system.
 * @module components/DashboardActivities
 *
 * This component:
 * - Fetches and displays recent system-wide activities.
 * - Uses animations for smooth UI updates.
 * - Automatically refreshes activities every 60 seconds.
 *
 * Features:
 * - Maps activity types to corresponding icons for better visualization.
 * - Displays loading indicators when fetching data.
 * - Uses Framer Motion for animations.
 *
 * @requires react - React library for building UI components.
 * @requires axios - Library for making HTTP requests.
 * @requires framer-motion - Animation library for smooth transitions.
 * @requires react-icons - Provides activity icons for better UI representation.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaUserEdit,
  FaUserTimes,
  FaClipboardList,
  FaClipboardCheck,
  FaClipboard,
} from "react-icons/fa";
import { motion } from "framer-motion";

/**
 * Maps activity types to corresponding React Icons.
 *
 * @param {String} activityType - The type of activity being logged.
 * @returns {JSX.Element} - Corresponding icon component.
 */
const getActivityIcon = (activityType) => {
  const icons = {
    INMATE_ADDED: <FaUserPlus className="text-blue-500 text-xl" />,
    INMATE_UPDATED: <FaUserEdit className="text-yellow-500 text-xl" />,
    INMATE_DELETED: <FaUserTimes className="text-red-500 text-xl" />,
    PAROLE_SUBMITTED: <FaClipboardList className="text-blue-500 text-xl" />,
    PAROLE_APPROVED: <FaClipboardCheck className="text-green-500 text-xl" />,
    PAROLE_DENIED: <FaClipboard className="text-red-500 text-xl" />,
  };

  return (
    icons[activityType] || <FaClipboardList className="text-gray-500 text-xl" />
  );
};

/**
 * DashboardActivities Component
 * -----------------------------
 * - Fetches and displays recent system-wide activities.
 * - Uses animations for a smooth user experience.
 *
 * @component
 * @returns {JSX.Element} - The recent activities UI component.
 */
const DashboardActivities = () => {
  const [activities, setActivities] = useState([]); // Holds fetched activity logs
  const [loading, setLoading] = useState(true); // Indicates loading state

  /**
   * Fetch Recent Activities
   * -----------------------
   * - Calls the API to retrieve system-wide activities from the last 24 hours.
   * - Updates the `activities` state with the response data.
   */
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const { data } = await axios.get(
          "http://localhost:5000/prisonsphere/recent-activities",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Auto-refresh activities every 60 seconds
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
      <p className="text-gray-600 text-sm mb-4">
        Tracking the latest system actions.
      </p>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-opacity-75"></div>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent activities.</p>
      ) : (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="divide-y divide-gray-200"
        >
          {activities.map((activity, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="py-3 flex items-center space-x-4"
            >
              <span>{getActivityIcon(activity.activityType)}</span>
              <div>
                <p className="font-medium text-gray-800">{activity.message}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

export default DashboardActivities;
