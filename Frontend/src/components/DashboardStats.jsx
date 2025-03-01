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
 * Displays key statistics for the prison system.
 * Fetches real-time data from the backend and updates dynamically.
 */

const DashboardStats = () => {
  const [stats, setStats] = useState(null); //initialize as null

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token"); //  Get authentication token
        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const { data } = await axios.get(
          "http://localhost:5000/prisonsphere/dashboard/stats",
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

  // Stats Data
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
      value: stats ? stats.recentReports : 0,
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
