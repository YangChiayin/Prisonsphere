/**
 * @file DashboardStats.js
 * @description Displays key prison statistics in the PrisonSphere system.
 * @module components/DashboardStats
 *
 * This component:
 * - Fetches real-time prison statistics from the backend.
 * - Displays inmate counts, rehabilitation numbers, parole hearings, and report counts.
 * - Uses animations for a smoother user experience.
 *
 * Features:
 * - Uses `Framer Motion` for interactive animations.
 * - Fetches data securely with authentication tokens.
 * - Dynamically updates statistics upon successful API response.
 *
 * @requires react - React library for building UI components.
 * @requires axios - Library for making HTTP requests.
 * @requires react-icons - Provides icons for visual representation.
 * @requires framer-motion - Animation library for smooth transitions.
 */

import React, { useEffect, useState } from "react";
import {
  FaUserFriends,
  FaProcedures,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";
import axios from "axios";
import { motion } from "framer-motion";

/**
 * DashboardStats Component
 * ------------------------
 * - Fetches and displays key statistics for the prison system.
 * - Uses icons for better visual representation.
 *
 * @component
 * @returns {JSX.Element} - The dashboard statistics UI component.
 */
const DashboardStats = () => {
  const [stats, setStats] = useState(null); //initialize as null

  /**
   * Fetch Dashboard Statistics
   * --------------------------
   * - Calls the API to retrieve key prison statistics.
   * - Updates the `stats` state with the response data.
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token"); //  Get authentication token
        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/prisonsphere/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`, //  Attach token to request
            },
          }
        );

        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  /**
   * Data Structure for Displaying Statistics
   * ----------------------------------------
   * - Maps API response data to display key statistics dynamically.
   */
  const statsData = [
    {
      label: "Total Inmates",
      value: stats ? stats.totalInmates : 0,
      icon: <FaUserFriends className="text-blue-600 text-3xl" />,
    },
    {
      label: "In Rehabilitation",
      value: stats ? stats.inRehabilitation : 0,
      icon: <FaProcedures className="text-green-500 text-3xl" />,
    },
    {
      label: "Upcoming Parole Hearings",
      value: stats ? stats.upcomingParole : 0,
      icon: <FaCalendarAlt className="text-yellow-500 text-3xl" />,
    },
    {
      label: "Recent Reports",
      value: stats ? stats.inRehabilitation : 0,
      icon: <FaFileAlt className="text-purple-500 text-3xl" />,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          className="bg-white shadow-md rounded-lg p-5 flex items-center justify-between border border-gray-200"
          whileHover={{ scale: 1.05 }}
        >
          <div>
            <p className="text-gray-600">{stat.label}</p>
            <h2 className="text-3xl font-bold">{stat.value}</h2>
          </div>
          {stat.icon}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;
